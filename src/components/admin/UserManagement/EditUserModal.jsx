import React, { useState, useEffect } from 'react';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { getDefaultPassword } from '../../../api/admin';
import { getActiveCourses } from '../../../api/professor';
import { updateStaffUserCourses } from '../../../api/admin';
import Input from '../../common/Input';
import Button from '../../common/Button';

const EditUserModal = ({ show, user, onClose }) => {
  const { handleUpdateStaff, loading } = useUserManagement();
  
  const [formData, setFormData] = useState({
    identifier: '',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    workingDay: '',
    activeToday: false,
    isDefault: false
  });

  // Password display state
  const [defaultPassword, setDefaultPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Course management state
  const [availableCourses, setAvailableCourses] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesChanged, setCoursesChanged] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        identifier: user.identifier || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        workingDay: user.workingDay || '',
        activeToday: user.activeToday || false,
        isDefault: user.isDefault || false
      });

      // Fetch password if user must change password
      if (user.mustChangePassword) {
        fetchDefaultPassword(user.id);
      }

      // Load courses if user is a professor
      if (user.roles?.includes('ROLE_PROFESSOR')) {
        loadCourses();
        setUserCourses(user.assignedCourses || []);
        setSelectedCourses((user.assignedCourses || []).map(course => course.id));
      }
    }
  }, [user]);

  // Fetch default password
  const fetchDefaultPassword = async (userId) => {
    setLoadingPassword(true);
    try {
      const response = await getDefaultPassword(userId);
      setDefaultPassword(response.password);
    } catch (error) {
      console.error('Error fetching default password:', error);
      setDefaultPassword('Error loading password');
    } finally {
      setLoadingPassword(false);
    }
  };

  // Load available courses
  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const courses = await getActiveCourses();
      setAvailableCourses(courses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Course management functions
  const addCourses = (courseIds) => {
    const coursesToAdd = availableCourses.filter(course => courseIds.includes(course.id));
    const newUserCourses = [...userCourses, ...coursesToAdd];
    const newSelectedCourses = [...selectedCourses, ...courseIds];
    
    setUserCourses(newUserCourses);
    setSelectedCourses(newSelectedCourses);
    
    // Check if courses changed
    const originalCourseIds = (user.assignedCourses || []).map(course => course.id);
    setCoursesChanged(!arraysEqual(newSelectedCourses.sort(), originalCourseIds.sort()));
  };

  const removeCourse = (courseId) => {
    const newUserCourses = userCourses.filter(course => course.id !== courseId);
    const newSelectedCourses = selectedCourses.filter(id => id !== courseId);
    
    setUserCourses(newUserCourses);
    setSelectedCourses(newSelectedCourses);
    
    // Check if courses changed
    const originalCourseIds = (user.assignedCourses || []).map(course => course.id);
    setCoursesChanged(!arraysEqual(newSelectedCourses.sort(), originalCourseIds.sort()));
  };

  const getAvailableCoursesToAdd = () => {
    // Return courses that are not already assigned
    return availableCourses.filter(course => !selectedCourses.includes(course.id));
  };

  // Helper function to compare arrays
  const arraysEqual = (a, b) => {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  };

  // Copy password to clipboard
  const copyPassword = () => {
    navigator.clipboard.writeText(defaultPassword);
    alert('Password copied to clipboard!');
  };

  // Save course changes
  const saveCourseChanges = async () => {
    try {
      await updateStaffUserCourses(user.id, selectedCourses);
      setCoursesChanged(false);
      // Optionally show success message
    } catch (error) {
      console.error('Error updating courses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleUpdateStaff(user.id, formData);
      
      // Save course changes if any
      if (coursesChanged) {
        await saveCourseChanges();
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (!show) return null;

  const isLibrarian = user?.roles?.includes('ROLE_LIBRARIAN');
  const isProfessor = user?.roles?.includes('ROLE_PROFESSOR');

  return (
    <div className="modal-backdrop">
      <div className="modal-container large">
        <div className="modal-header">
          <h3>Edit User: {user?.identifier}</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Basic Information */}
            <div className="form-section">
              <h4>Basic Information</h4>
              <div className="form-row">
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled
                />
              </div>

              <div className="form-row">
                <Input
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <div className="form-group">
                  <label>Location</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="form-control"
                  >
                    <option value="GISHUSHU">Gishushu Campus</option>
                    <option value="MASORO">Masoro Campus</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password Display Section */}
            {user?.mustChangePassword && (
              <div className="form-section">
                <h4>Password Information</h4>
                <div className="form-group">
                  <label>Default Password</label>
                  <div className="password-display">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loadingPassword ? "Loading..." : defaultPassword}
                      className="form-control password-field"
                      readOnly
                    />
                    <div className="password-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={copyPassword}
                        title="Copy password"
                        disabled={loadingPassword || !defaultPassword}
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                  <small className="password-note">
                    <i className="fas fa-info-circle"></i>
                    This is the temporary password. User must change it on first login.
                  </small>
                </div>
              </div>
            )}

            {/* Professor Course Management */}
            {isProfessor && (
              <div className="form-section">
                <h4>Course Management</h4>
                
                {/* Current Courses Display */}
                <div className="current-courses">
                  <label>Currently Assigned Courses ({userCourses.length})</label>
                  {userCourses.length > 0 ? (
                    <div className="assigned-courses-list">
                      {userCourses.map((course, index) => (
                        <div key={index} className="assigned-course-item">
                          <div className="course-info">
                            <span className="course-code">{course.courseCode}</span>
                            <span className="course-name">{course.courseName}</span>
                            <span className="course-credits">({course.creditHours} credits)</span>
                          </div>
                          <button
                            type="button"
                            className="btn-remove-course"
                            onClick={() => removeCourse(course.id)}
                            title="Remove course"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-courses-assigned">
                      <small className="text-muted">No courses currently assigned</small>
                    </div>
                  )}
                </div>

                {/* Add Course Section */}
                <div className="add-course-section">
                  <label>Add Courses</label>
                  {loadingCourses ? (
                    <div className="loading-courses">Loading available courses...</div>
                  ) : (
                    <div className="course-dropdown-container">
                      {availableCourses.length === 0 ? (
                        <p>No additional courses available</p>
                      ) : (
                        <>
                          <select
                            multiple
                            value={[]} // Always empty since we're adding, not selecting existing
                            onChange={(e) => {
                              const selectedCourseIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                              addCourses(selectedCourseIds);
                              e.target.value = []; // Clear selection after adding
                            }}
                            className="form-control course-select"
                            size="6"
                          >
                            {getAvailableCoursesToAdd().map(course => (
                              <option key={course.id} value={course.id}>
                                {course.courseCode} - {course.courseName} ({course.creditHours} credits)
                              </option>
                            ))}
                          </select>
                          <small className="form-help">
                            Hold Ctrl/Cmd to select multiple courses to add
                          </small>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {coursesChanged && (
                  <div className="course-changes-notice">
                    <i className="fas fa-info-circle"></i>
                    Course assignments have been modified. Changes will be saved when you update the user.
                  </div>
                )}
              </div>
            )}

            {/* Librarian-specific fields */}
            {isLibrarian && (
              <div className="form-section">
                <h4>Librarian Settings</h4>
                <div className="form-row">
                  <Input
                    label="Working Day"
                    type="date"
                    value={formData.workingDay}
                    onChange={(e) => setFormData({...formData, workingDay: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.activeToday}
                      onChange={(e) => setFormData({...formData, activeToday: e.target.checked})}
                    />
                    Active Today
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    />
                    Default Librarian
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;