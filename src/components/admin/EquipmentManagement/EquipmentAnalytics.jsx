import React, { useState, useEffect } from 'react';
import { 
  getEquipmentUsageStats,
  getSystemOverview 
} from '../../../api/analytics';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import LoadingSpinner from '../../common/LoadingSpinner';
import Alert from '../../common/Alert';

const EquipmentAnalytics = () => {
  const [usageStats, setUsageStats] = useState([]);
  const [systemOverview, setSystemOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [usage, overview] = await Promise.all([
        getEquipmentUsageStats(dateRange.startDate, dateRange.endDate),
        getSystemOverview()
      ]);
      
      setUsageStats(usage);
      setSystemOverview(overview);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTopEquipment = () => {
    return usageStats
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, 10);
  };

  const getRequestStatusData = () => {
    const totalApproved = usageStats.reduce((sum, eq) => sum + eq.approvedRequests, 0);
    const totalRejected = usageStats.reduce((sum, eq) => sum + eq.rejectedRequests, 0);
    const totalPending = usageStats.reduce((sum, eq) => sum + eq.pendingRequests, 0);
    
    return [
      { name: 'Approved', value: totalApproved, color: '#10b981' },
      { name: 'Rejected', value: totalRejected, color: '#ef4444' },
      { name: 'Pending', value: totalPending, color: '#f59e0b' }
    ];
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Equipment Analytics</h1>
            <p className="admin-subtitle">
              Equipment usage statistics and insights
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert type="danger" message={error} onClose={() => setError('')} />
      )}

      {/* Date Range Filter */}
      <div className="admin-card">
        <div className="card-body">
          <div className="analytics-filters">
            <div className="date-range-filter">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="form-control"
                />
              </div>
              <button 
                className="btn btn-primary"
                onClick={loadAnalyticsData}
              >
                <i className="fas fa-sync-alt"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Overview */}
      {systemOverview && (
        <div className="stats-grid">
          <div className="stat-item available">
            <div className="stat-value">{systemOverview.totalEquipment}</div>
            <div className="stat-label">Total Equipment</div>
          </div>
          <div className="stat-item library">
            <div className="stat-value">{systemOverview.totalRequests}</div>
            <div className="stat-label">Total Requests</div>
          </div>
          <div className="stat-item maintenance">
            <div className="stat-value">{systemOverview.recentRequests}</div>
            <div className="stat-label">Recent Requests</div>
          </div>
          <div className="stat-item study">
            <div className="stat-value">{systemOverview.totalProfessors}</div>
            <div className="stat-label">Active Professors</div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="analytics-grid">
        {/* Top Equipment Chart */}
        <div className="admin-card">
          <div className="card-header">
            <h3>Most Requested Equipment</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getTopEquipment()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="equipmentName" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalRequests" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Request Status Pie Chart */}
        <div className="admin-card">
          <div className="card-header">
            <h3>Request Status Distribution</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getRequestStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getRequestStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Equipment Usage Table */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Equipment Usage Details</h3>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Total Requests</th>
                  <th>Approved</th>
                  <th>Rejected</th>
                  <th>Pending</th>
                  <th>Last Request</th>
                  <th>Unique Users</th>
                </tr>
              </thead>
              <tbody>
                {usageStats.map(equipment => (
                  <tr key={equipment.equipmentId}>
                    <td>
                      <strong>{equipment.equipmentName}</strong>
                    </td>
                    <td>{equipment.totalRequests}</td>
                    <td>
                      <span className="status-badge green">
                        {equipment.approvedRequests}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge red">
                        {equipment.rejectedRequests}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge orange">
                        {equipment.pendingRequests}
                      </span>
                    </td>
                    <td>
                      {equipment.lastRequestDate 
                        ? new Date(equipment.lastRequestDate).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td>{equipment.uniqueUsers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentAnalytics;