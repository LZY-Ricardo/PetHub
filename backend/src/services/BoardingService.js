const BoardingDAO = require('../dao/BoardingDAO');
const UserPetDAO = require('../dao/UserPetDAO');
const NotificationService = require('./NotificationService');
const {
  BOARDING_STATUS,
  isTransitionAllowed,
  getActionFlags
} = require('./boardingStateMachine');

class BoardingService {
  normalizeRecord(record, role = 'user') {
    if (!record) {
      return null;
    }

    return {
      ...record,
      actions: getActionFlags(record.status, role),
      petSnapshot: {
        name: record.pet_name,
        type: record.pet_type,
        breed: record.pet_breed,
        age: record.pet_age,
        gender: record.pet_gender,
        healthNotes: record.pet_health_notes
      }
    };
  }

  validateDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new Error('寄养开始时间和结束时间不能为空');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error('寄养时间格式不正确');
    }

    if (start >= end) {
      throw new Error('寄养结束时间必须晚于开始时间');
    }
  }

  async buildPetSnapshot(sourceType, linkedPetId, petSnapshotInput, userId) {
    if (sourceType === 'profile') {
      if (!linkedPetId) {
        throw new Error('请选择宠物档案');
      }

      const pet = await UserPetDAO.getUserPetById(Number(linkedPetId));
      if (!pet) {
        throw new Error('宠物档案不存在');
      }
      if (pet.user_id !== userId) {
        throw new Error('不能选择他人的宠物档案');
      }

      return {
        linkedPetId: pet.id,
        petSnapshot: {
          pet_name: pet.name,
          pet_type: pet.pet_type || '',
          pet_breed: pet.breed || '',
          pet_age: pet.age != null ? String(pet.age) : '',
          pet_gender: pet.gender || '',
          pet_health_notes: pet.health_notes || ''
        }
      };
    }

    if (!petSnapshotInput?.name) {
      throw new Error('请填写宠物名称');
    }

    return {
      linkedPetId: null,
      petSnapshot: {
        pet_name: petSnapshotInput.name,
        pet_type: petSnapshotInput.type || '',
        pet_breed: petSnapshotInput.breed || '',
        pet_age: petSnapshotInput.age || '',
        pet_gender: petSnapshotInput.gender || '',
        pet_health_notes: petSnapshotInput.healthNotes || ''
      }
    };
  }

  async createApplication(applicationData, userId) {
    const {
      sourceType,
      linkedPetId,
      petSnapshot,
      startDate,
      endDate,
      contactPhone,
      emergencyContact,
      specialCareNotes,
      remark
    } = applicationData;

    if (!['profile', 'manual'].includes(sourceType)) {
      throw new Error('宠物来源无效');
    }

    if (!contactPhone) {
      throw new Error('联系方式不能为空');
    }

    this.validateDateRange(startDate, endDate);

    const snapshotResult = await this.buildPetSnapshot(sourceType, linkedPetId, petSnapshot, userId);
    const boardingId = await BoardingDAO.createBoardingApplication({
      user_id: userId,
      status: BOARDING_STATUS.PENDING,
      source_type: sourceType,
      linked_pet_id: snapshotResult.linkedPetId,
      start_date: startDate,
      end_date: endDate,
      contact_phone: contactPhone,
      emergency_contact: emergencyContact || null,
      special_care_notes: specialCareNotes || null,
      remark: remark || null,
      ...snapshotResult.petSnapshot
    });

    const created = await BoardingDAO.getBoardingApplicationById(boardingId);

    await NotificationService.createNotification({
      userId,
      type: 'boarding',
      title: '寄养申请已提交',
      content: `您提交的宠物「${created.pet_name}」公益寄养申请已进入待处理。`,
      relatedType: 'boarding_application',
      relatedId: boardingId,
      actionUrl: '/boarding'
    });

    await NotificationService.notifyAdmins({
      type: 'boarding',
      title: '新的寄养申请待处理',
      content: `用户「${created.user_name || userId}」提交了宠物「${created.pet_name}」的公益寄养申请。`,
      relatedType: 'boarding_application',
      relatedId: boardingId,
      actionUrl: '/admin/boarding'
    });

    return this.normalizeRecord(created, 'user');
  }

  async getUserApplications(userId) {
    const records = await BoardingDAO.getBoardingApplicationsByUser(userId);
    return records.map(record => this.normalizeRecord(record, 'user'));
  }

  async getApplicationDetail(id, currentUser) {
    const record = await BoardingDAO.getBoardingApplicationById(Number(id));
    if (!record) {
      throw new Error('寄养申请不存在');
    }

    if (currentUser.role !== 'admin' && record.user_id !== currentUser.userId) {
      throw new Error('无权限查看该寄养申请');
    }

    return this.normalizeRecord(record, currentUser.role);
  }

  async getAdminApplicationList(query) {
    const result = await BoardingDAO.getBoardingApplicationList(query);
    return {
      ...result,
      list: result.list.map(record => this.normalizeRecord(record, 'admin'))
    };
  }

  async getAdminApplicationDetail(id) {
    const record = await BoardingDAO.getBoardingApplicationById(Number(id));
    if (!record) {
      throw new Error('寄养申请不存在');
    }

    return this.normalizeRecord(record, 'admin');
  }

  async updateStatus(id, nextStatus, patch = {}) {
    const record = await BoardingDAO.getBoardingApplicationById(Number(id));
    if (!record) {
      throw new Error('寄养申请不存在');
    }

    if (!isTransitionAllowed(record.status, nextStatus)) {
      throw new Error('当前状态不允许执行该操作');
    }

    await BoardingDAO.updateBoardingApplication(Number(id), {
      status: nextStatus,
      ...patch
    });

    return BoardingDAO.getBoardingApplicationById(Number(id));
  }

  async reviewApplication(id, action, reviewComment, adminUserId) {
    if (!['approve', 'reject'].includes(action)) {
      throw new Error('无效的审核动作');
    }

    const targetStatus = action === 'approve' ? BOARDING_STATUS.CONFIRMED : BOARDING_STATUS.REJECTED;
    const updated = await this.updateStatus(id, targetStatus, {
      reviewed_by: adminUserId,
      reviewed_at: new Date(),
      review_comment: reviewComment || null
    });

    await NotificationService.createNotification({
      userId: updated.user_id,
      type: 'boarding',
      title: action === 'approve' ? '寄养申请已确认' : '寄养申请未通过',
      content: action === 'approve'
        ? `您的宠物「${updated.pet_name}」寄养申请已确认，请等待入住安排。`
        : `您的宠物「${updated.pet_name}」寄养申请未通过。${reviewComment ? `原因：${reviewComment}` : ''}`,
      relatedType: 'boarding_application',
      relatedId: updated.id,
      actionUrl: '/boarding'
    });

    return this.normalizeRecord(updated, 'admin');
  }

  async cancelByUser(id, reason, userId) {
    if (!reason) {
      throw new Error('取消原因不能为空');
    }

    const record = await BoardingDAO.getBoardingApplicationById(Number(id));
    if (!record) {
      throw new Error('寄养申请不存在');
    }

    if (record.user_id !== userId) {
      throw new Error('无权限取消该寄养申请');
    }

    const updated = await this.updateStatus(id, BOARDING_STATUS.CANCELLED, {
      cancelled_by_role: 'user',
      cancelled_by: userId,
      cancel_reason: reason
    });

    await NotificationService.notifyAdmins({
      type: 'boarding',
      title: '寄养申请已被用户取消',
      content: `用户已取消宠物「${updated.pet_name}」的公益寄养申请。`,
      relatedType: 'boarding_application',
      relatedId: updated.id,
      actionUrl: '/admin/boarding'
    });

    return this.normalizeRecord(updated, 'user');
  }

  async cancelByAdmin(id, reason, adminUserId) {
    if (!reason) {
      throw new Error('取消原因不能为空');
    }

    const updated = await this.updateStatus(id, BOARDING_STATUS.CANCELLED, {
      cancelled_by_role: 'admin',
      cancelled_by: adminUserId,
      cancel_reason: reason
    });

    await NotificationService.createNotification({
      userId: updated.user_id,
      type: 'boarding',
      title: '寄养申请已取消',
      content: `管理员已取消宠物「${updated.pet_name}」的公益寄养申请。${reason ? `原因：${reason}` : ''}`,
      relatedType: 'boarding_application',
      relatedId: updated.id,
      actionUrl: '/boarding'
    });

    return this.normalizeRecord(updated, 'admin');
  }

  async checkInApplication(id, note, adminUserId) {
    const updated = await this.updateStatus(id, BOARDING_STATUS.BOARDING, {
      reviewed_by: adminUserId,
      checked_in_at: new Date(),
      check_in_note: note || null
    });

    await NotificationService.createNotification({
      userId: updated.user_id,
      type: 'boarding',
      title: '宠物已开始寄养',
      content: `宠物「${updated.pet_name}」已登记入住，当前状态为寄养中。`,
      relatedType: 'boarding_application',
      relatedId: updated.id,
      actionUrl: '/boarding'
    });

    return this.normalizeRecord(updated, 'admin');
  }

  async completeApplication(id, note, adminUserId) {
    const updated = await this.updateStatus(id, BOARDING_STATUS.COMPLETED, {
      reviewed_by: adminUserId,
      completed_at: new Date(),
      completion_note: note || null
    });

    await NotificationService.createNotification({
      userId: updated.user_id,
      type: 'boarding',
      title: '寄养已完成',
      content: `宠物「${updated.pet_name}」本次公益寄养已完成。`,
      relatedType: 'boarding_application',
      relatedId: updated.id,
      actionUrl: '/boarding'
    });

    return this.normalizeRecord(updated, 'admin');
  }
}

module.exports = new BoardingService();
