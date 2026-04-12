const AdoptionDAO = require('../dao/AdoptionDAO');
const PetDAO = require('../dao/PetDAO');
const NotificationService = require('./NotificationService');

class AdoptionService {
  async getApplicationList(page, pageSize, filters = {}) {
    return await AdoptionDAO.getApplicationList(page, pageSize, filters);
  }

  async getApplicationStats() {
    return await AdoptionDAO.getApplicationStats();
  }

  async getApplicationDetail(id) {
    const application = await AdoptionDAO.getApplicationDetail(id);
    if (!application) {
      throw new Error('申请不存在');
    }
    return application;
  }

  async getUserApplications(userId) {
    return await AdoptionDAO.getUserApplications(userId);
  }

  async createApplication(applicationData, userId) {
    const { petId, reason, experience, contact, address } = applicationData;

    // 检查宠物是否存在且可领养
    const pet = await PetDAO.findById(petId);
    if (!pet) {
      throw new Error('宠物不存在');
    }

    if (pet.status !== 'available') {
      throw new Error('该宠物暂不可领养');
    }

    // 检查是否已有待审核申请
    const hasPending = await AdoptionDAO.checkPendingApplication(userId, petId);
    if (hasPending) {
      throw new Error('您已有待审核的申请，请勿重复提交');
    }

    // 验证必填字段
    if (!reason || !contact || !address) {
      throw new Error('申请理由、联系方式和居住地址不能为空');
    }

    const applicationId = await AdoptionDAO.createApplication({
      userId,
      petId,
      reason,
      experience,
      contact,
      address
    });

    await NotificationService.notifyAdmins({
      type: 'adoption',
      title: '新的领养申请待处理',
      content: `用户提交了宠物「${pet.name}」的领养申请，请及时审核。`,
      relatedType: 'adoption_application',
      relatedId: applicationId,
      actionUrl: `/adoptions?focusId=${applicationId}`
    });

    return await AdoptionDAO.findById(applicationId);
  }

  async reviewApplication(id, status, reviewComment, reviewedBy) {
    const application = await AdoptionDAO.findById(id);
    if (!application) {
      throw new Error('申请不存在');
    }

    if (application.status !== 'pending') {
      throw new Error('该申请已被审核');
    }

    if (!['approved', 'rejected'].includes(status)) {
      throw new Error('无效的审核状态');
    }

    const normalizedComment = (reviewComment || '').trim();
    const finalReviewComment = status === 'rejected'
      ? (normalizedComment || '申请未通过审核，请联系管理员咨询具体原因')
      : normalizedComment;

    const otherPending = status === 'approved'
      ? await AdoptionDAO.getOtherPendingApplications(application.pet_id, id)
      : [];

    await AdoptionDAO.reviewApplication(id, status, finalReviewComment, reviewedBy);

    await NotificationService.createNotification({
      userId: application.user_id,
      type: 'adoption',
      title: status === 'approved' ? '领养申请已通过' : '领养申请未通过',
      content: status === 'approved'
        ? `您对宠物 #${application.pet_id} 的领养申请已通过审核。`
        : `您对宠物 #${application.pet_id} 的领养申请未通过。${finalReviewComment ? `备注：${finalReviewComment}` : ''}`,
      relatedType: 'adoption_application',
      relatedId: id,
      actionUrl: `/adoptions?focusId=${id}`
    });

    // 如果审核通过，更新宠物状态
    if (status === 'approved') {
      await PetDAO.updatePetStatus(application.pet_id, 'adopted');

      // 自动驳回同宠物的其他待审核申请，并写入明确原因
      const autoRejectReason = '该宠物已被其他申请人领养，当前申请已自动驳回';
      await AdoptionDAO.rejectOtherPendingApplications(
        application.pet_id,
        id,
        autoRejectReason,
        reviewedBy
      );

      for (const item of otherPending) {
        await NotificationService.createNotification({
          userId: item.user_id,
          type: 'adoption',
          title: '领养申请已自动驳回',
          content: autoRejectReason,
          relatedType: 'adoption_application',
          relatedId: item.id,
          actionUrl: `/adoptions?focusId=${item.id}`
        });
      }
    }

    return { success: true };
  }
}

module.exports = new AdoptionService();
