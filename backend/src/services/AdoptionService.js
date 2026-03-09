const AdoptionDAO = require('../dao/AdoptionDAO');
const PetDAO = require('../dao/PetDAO');

class AdoptionService {
  async getApplicationList(page, pageSize, status) {
    return await AdoptionDAO.getApplicationList(page, pageSize, status);
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

    await AdoptionDAO.reviewApplication(id, status, finalReviewComment, reviewedBy);

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
    }

    return { success: true };
  }
}

module.exports = new AdoptionService();
