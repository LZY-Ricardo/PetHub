const PetDAO = require('../dao/PetDAO');

/**
 * 宠物服务
 * 处理宠物相关的业务逻辑
 */
class PetService {
  validateBasePetData(petData) {
    const requiredFields = ['name', 'breed', 'gender', 'age'];
    for (const field of requiredFields) {
      if (!petData[field]) {
        throw new Error(`${field}不能为空`);
      }
    }

    if (!['male', 'female'].includes(petData.gender)) {
      throw new Error('性别参数错误');
    }

    if (Number(petData.age) < 0 || Number(petData.age) > 30) {
      throw new Error('年龄参数错误');
    }

    if (petData.healthStatus && !['good', 'fair', 'poor'].includes(petData.healthStatus)) {
      throw new Error('健康状态参数错误');
    }
  }

  async getPetList(filters, page, pageSize, options = {}) {
    return PetDAO.getPetList(filters, page, pageSize, options);
  }

  async getPetDetail(id, viewer = null) {
    const pet = await PetDAO.getPetDetail(id);

    if (!pet) {
      throw new Error('宠物不存在');
    }

    const isAdmin = viewer?.role === 'admin';
    const isOwner = viewer?.userId && pet.owner_user_id === viewer.userId;

    if (!isAdmin && !isOwner && pet.submission_status !== 'approved') {
      throw new Error('宠物不存在');
    }

    return PetDAO.parsePet(pet);
  }

  async createPet(petData, createdBy) {
    this.validateBasePetData(petData);

    if (petData.status && !['available', 'pending', 'adopted', 'off_shelf'].includes(petData.status)) {
      throw new Error('状态参数错误');
    }

    const petId = await PetDAO.createPet({
      ...petData,
      sourceType: 'platform',
      submissionStatus: 'approved',
      submissionComment: null,
      ownerUserId: null
    }, createdBy);

    return this.getPetDetail(petId, { userId: createdBy, role: 'admin' });
  }

  async updatePet(id, petData) {
    const pet = await PetDAO.findById(id);
    if (!pet) {
      throw new Error('宠物不存在');
    }

    if (petData.gender && !['male', 'female'].includes(petData.gender)) {
      throw new Error('性别参数错误');
    }

    if (petData.healthStatus && !['good', 'fair', 'poor'].includes(petData.healthStatus)) {
      throw new Error('健康状态参数错误');
    }

    if (petData.status && !['available', 'pending', 'adopted', 'off_shelf'].includes(petData.status)) {
      throw new Error('状态参数错误');
    }

    await PetDAO.updatePet(id, {
      name: petData.name ?? pet.name,
      breed: petData.breed ?? pet.breed,
      gender: petData.gender ?? pet.gender,
      age: petData.age ?? pet.age,
      healthStatus: petData.healthStatus ?? pet.health_status,
      personality: petData.personality ?? pet.personality,
      vaccination: petData.vaccination ?? pet.vaccination,
      sterilized: petData.sterilized ?? Boolean(pet.sterilized),
      sourceType: petData.sourceType ?? pet.source_type,
      submissionStatus: petData.submissionStatus ?? pet.submission_status,
      submissionComment: petData.submissionComment ?? pet.submission_comment,
      status: petData.status ?? pet.status,
      photos: petData.photos ?? pet.photos,
      remarks: petData.remarks ?? pet.remarks,
      ownerUserId: petData.ownerUserId ?? pet.owner_user_id
    });

    return this.getPetDetail(id, { role: 'admin' });
  }

  async deletePet(id) {
    const pet = await PetDAO.findById(id);
    if (!pet) {
      throw new Error('宠物不存在');
    }

    if (pet.status === 'adopted') {
      throw new Error('已领养的宠物不能删除');
    }

    await PetDAO.deletePet(id);
    return { success: true };
  }

  async getStatistics() {
    return PetDAO.getStatistics();
  }

  async createUserPetSubmission(petData, userId) {
    this.validateBasePetData(petData);

    const petId = await PetDAO.createPet({
      ...petData,
      status: 'pending',
      sourceType: 'user',
      submissionStatus: 'pending',
      submissionComment: null,
      ownerUserId: userId
    }, userId);

    return this.getPetDetail(petId, { userId, role: 'user' });
  }

  async getUserPetSubmissions(userId) {
    return PetDAO.getPetList(
      { ownerUserId: userId },
      1,
      100,
      { isAdminView: true }
    ).then((result) => result.list);
  }

  async updateUserPetSubmission(id, petData, userId) {
    const pet = await PetDAO.findById(id);
    if (!pet || pet.owner_user_id !== userId) {
      throw new Error('送养发布不存在');
    }

    if (!['pending', 'rejected'].includes(pet.submission_status) || ['adopted', 'off_shelf'].includes(pet.status)) {
      throw new Error('当前状态不可编辑');
    }

    this.validateBasePetData({
      ...pet,
      ...petData,
      healthStatus: petData.healthStatus ?? pet.health_status
    });

    await PetDAO.updateUserSubmission(id, userId, {
      ...petData,
      submissionStatus: 'pending',
      submissionComment: null,
      status: 'pending'
    });

    return this.getPetDetail(id, { userId, role: 'user' });
  }

  async resubmitUserPetSubmission(id, userId) {
    const pet = await PetDAO.findById(id);
    if (!pet || pet.owner_user_id !== userId) {
      throw new Error('送养发布不存在');
    }

    if (pet.submission_status !== 'rejected') {
      throw new Error('当前状态不可重新提交');
    }

    await PetDAO.updateUserSubmission(id, userId, {
      submissionStatus: 'pending',
      submissionComment: null,
      status: 'pending'
    });

    return this.getPetDetail(id, { userId, role: 'user' });
  }

  async getPendingPetSubmissions(page, pageSize) {
    return PetDAO.getPetList(
      { sourceType: 'user', submissionStatus: 'pending' },
      page,
      pageSize,
      { isAdminView: true }
    );
  }

  async reviewPetSubmission(id, status, reviewComment, reviewedBy, notificationService) {
    const pet = await PetDAO.findById(id);
    if (!pet) {
      throw new Error('送养发布不存在');
    }

    if (pet.source_type !== 'user') {
      throw new Error('仅用户送养发布需要审核');
    }

    if (!['approved', 'rejected'].includes(status)) {
      throw new Error('审核状态无效');
    }

    const trimmedComment = (reviewComment || '').trim();
    const finalComment = status === 'rejected'
      ? (trimmedComment || '送养发布未通过审核，请调整后重新提交')
      : (trimmedComment || '送养发布已通过审核');
    const petStatus = status === 'approved' ? 'available' : 'pending';

    await PetDAO.reviewPetSubmission(id, status, finalComment, petStatus);

    if (pet.owner_user_id) {
      await notificationService.createNotification({
        userId: pet.owner_user_id,
        type: 'adoption',
        title: status === 'approved' ? '送养发布审核已通过' : '送养发布审核未通过',
        content: status === 'approved'
          ? `您发布的送养宠物「${pet.name}」已通过审核。`
          : `您发布的送养宠物「${pet.name}」未通过审核。备注：${finalComment}`,
        relatedType: 'pet_submission',
        relatedId: pet.id,
        actionUrl: '/my-pet-submissions'
      });
    }

    return this.getPetDetail(id, { userId: reviewedBy, role: 'admin' });
  }
}

module.exports = new PetService();
