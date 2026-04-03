import React from 'react';
import { Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BoardingApplicationForm from '../../components/Boarding/BoardingApplicationForm';
import './BoardingApplicationPage.css';

function BoardingApplicationPage() {
  const navigate = useNavigate();
  const { handleTokenExpired } = useAuth();
  const [userPets, setUserPets] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const getAuthHeader = React.useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchUserPets = React.useCallback(async () => {
    try {
      const response = await fetch('/api/user-pets', {
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 200) {
        setUserPets(data.data || []);
      }
    } catch (error) {
      message.error('获取宠物档案失败');
    }
  }, [getAuthHeader, handleTokenExpired, navigate]);

  React.useEffect(() => {
    fetchUserPets();
  }, [fetchUserPets]);

  const handleSubmit = async (payload, form) => {
    setLoading(true);
    try {
      const response = await fetch('/api/boarding-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        handleTokenExpired();
        navigate('/login', { replace: true });
        return;
      }

      const data = await response.json();
      if (data.code === 201) {
        message.success('寄养申请已提交');
        form.resetFields();
        navigate('/boarding');
      } else {
        message.error(data.message || '提交失败');
      }
    } catch (error) {
      message.error('提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="boarding-application-page">
      <Card bordered={false} title="公益寄养申请">
        <BoardingApplicationForm
          userPets={userPets}
          onSubmit={handleSubmit}
          submitting={loading}
          onManagePets={() => navigate('/my-pets')}
        />
      </Card>
    </div>
  );
}

export default BoardingApplicationPage;
