import React, { useState, useEffect } from 'react';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { 
  checkEmailAvailability, 
  checkEmployeeIdAvailability 
} from '../../../api/user';
import Input from '../../common/Input';
import Button from '../../common/Button';
import Alert from '../../common/Alert';
import { getActiveCourses } from '../../../api/professor';

const CreateStaffModal = ({ show, onClose }) => {
  const { handleCreateStaff, loading } = useUserManagement();
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    employeeId: '',
    phone: '',
    location: 'GISHUSHU',
    role: 'LIBRARIAN',
    workingDay: '',
    activeToday: false,
    isDefault: false,
    courseIds: [] 
  });
  
  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState({});

  const roleOptions = [
    { value: 'LIBRARIAN', label: 'Librarian', needsWorkingDay: true },
    { value: 'PROFESSOR', label: 'Professor', needsWorkingDay: false },
    { value: 'ADMIN', label: 'Admin', needsWorkingDay: false },
    { value: 'EQUIPMENT_ADMIN', label: 'Equipment Admin', needsWorkingDay: false },
    { value: 'HOD', label: 'Head of Department', needsWorkingDay: false }
  ];

  const locationOptions = [
    { value: 'GISHUSHU', label: 'Gishushu Campus' },
    { value: 'MASORO', label: 'Masoro Campus' },
    { value: 'KIGALI', label: 'Kigali' },
    { value: 'NYANZA', label: 'Nyanza' },
    { value: 'MUSANZE', label: 'Musanze' }
  ];

  useEffect(() => {
    if (formData.role === 'PROFESSOR') {
      loadCourses();
    }
  }, [formData.role]);


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

  const handleCourseSelection = (e) => {
  const courseId = parseInt(e.target.value);
  const isChecked = e.target.checked;
  
  setFormData(prev => ({
    ...prev,
    courseIds: isChecked 
      ? [...prev.courseIds, courseId]
      : prev.courseIds.filter(id => id !== courseId)
  }));
};

  const validateField = async (field, value) => {
    const newErrors = { ...errors };
    setValidating(prev => ({ ...prev, [field]: true }));

    try {
      switch (field) {
        case 'fullName':
          if (!value.trim()) {
            newErrors.fullName = 'Full name is required';
          } else if (value.trim().length < 3) {
            newErrors.fullName = 'Full name must be at least 3 characters';
          } else {
            delete newErrors.fullName;
          }
          break;

        case 'email':
          if (!value) {
            newErrors.email = 'Email is required';
          } else if (!/\S+@\S+\.\S+/.test(value)) {
            newErrors.email = 'Email format is invalid';
          } else {
            try {
              const response = await checkEmailAvailability(value);
              if (response.exists) {
                newErrors.email = 'Email is already in use';
              } else {
                delete newErrors.email;
              }
            } catch (error) {
              // Assume available if check fails
              delete newErrors.email;
            }
          }
          break;

        case 'employeeId':
          if (!value) {
            newErrors.employeeId = 'Employee ID is required';
          } else if (value.length < 3) {
            newErrors.employeeId = 'Employee ID must be at least 3 characters';
          } else {
            try {
              const response = await checkEmployeeIdAvailability(value);
              if (response.exists) {
                newErrors.employeeId = 'Employee ID is already in use';
              } else {
                delete newErrors.employeeId;
              }
            } catch (error) {
              // Assume available if check fails
              delete newErrors.employeeId;
            }
          }
          break;

        case 'phone':
          if (value && !/^\+?[\d\s-()]+$/.test(value)) {
            newErrors.phone = 'Invalid phone number format';
          } else {
            delete newErrors.phone;
          }
          break;

        case 'workingDay':
          if (formData.role === 'LIBRARIAN' && !value) {
            newErrors.workingDay = 'Working day is required for librarians';
          } else {
            delete newErrors.workingDay;
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(`Validation error for ${field}:`, error);
    }

    setErrors(newErrors);
    setValidating(prev => ({ ...prev, [field]: false }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateForm = async () => {
    const fields = ['fullName', 'email', 'employeeId', 'phone', 'workingDay'];
    
    for (const field of fields) {
      await validateField(field, formData[field]);
    }
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      await handleCreateStaff(formData);
      onClose();
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        employeeId: '',
        phone: '',
        location: 'GISHUSHU',
        role: 'LIBRARIAN',
        workingDay: '',
        activeToday: false,
        isDefault: false
      });
      setErrors({});
    } catch (error) {
      // Error is handled in the context
      console.error('Error creating staff:', error);
    }
  };

  const selectedRole = roleOptions.find(r => r.value === formData.role);
  const needsWorkingDay = selectedRole?.needsWorkingDay;

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container large">
        <div className="modal-header">
          <h3>Create Staff User</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Full Name *"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.fullName}
                  required
                />
              </div>
              
              <div className="form-group">
                <Input
                  label="Email *"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  required
                  loading={validating.email}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Employee ID *"
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.employeeId}
                  required
                  loading={validating.employeeId}
                />
              </div>
              
              <div className="form-group">
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.phone}
                  placeholder="+250788123456"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Location *</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  {locationOptions.map(location => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Professor Course Selection */}
{formData.role === 'PROFESSOR' && (
  <div className="form-section">
    <h4>Course Assignment</h4>
    <p className="form-help">Select courses to assign to this professor</p>
    
    {loadingCourses ? (
      <div className="loading-courses">Loading courses...</div>
    ) : (
      <div className="course-dropdown-container">
        {availableCourses.length === 0 ? (
          <p>No courses available</p>
        ) : (
          <>
            <select
              multiple
              value={formData.courseIds.map(String)}
              onChange={(e) => {
                const selectedCourseIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                setFormData(prev => ({ ...prev, courseIds: selectedCourseIds }));
              }}
              className="form-control course-select"
              size="6"
            >
              {availableCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.courseCode} - {course.courseName} ({course.creditHours} credits)
                </option>
              ))}
            </select>
            <small className="form-help">
              Hold Ctrl/Cmd to select multiple courses
            </small>
          </>
        )}
      </div>
    )}
    
    {formData.courseIds.length > 0 && (
      <div className="selected-courses-summary">
        <small>{formData.courseIds.length} course(s) selected</small>
      </div>
    )}
  </div>
)}
            {/* Librarian-specific fields */}
            {needsWorkingDay && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <Input
                      label="Working Day *"
                      type="date"
                      name="workingDay"
                      value={formData.workingDay}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.workingDay}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="activeToday"
                        checked={formData.activeToday}
                        onChange={handleChange}
                      />
                      <span className="checkmark"></span>
                      Active Today
                    </label>
                    <small className="form-text">
                      Check if this librarian should be active today
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleChange}
                      />
                      <span className="checkmark"></span>
                      Default Librarian for {formData.location}
                    </label>
                    <small className="form-text">
                      Only one default librarian per location is allowed
                    </small>
                  </div>
                </div>
              </>
            )}

            {/* Role Information */}
            <div className="role-info">
              <h4>Role Information</h4>
              <div className="info-card">
                {formData.role === 'LIBRARIAN' && (
                  <div>
                    <p><strong>Librarian Role:</strong></p>
                    <ul>
                      <li>Manage library operations for {formData.location} campus</li>
                      <li>Handle book management and user assistance</li>
                      <li>Requires working day assignment</li>
                      <li>Location-specific access controls</li>
                    </ul>
                  </div>
                )}
                {formData.role === 'PROFESSOR' && (
                  <div>
                    <p><strong>Professor Role:</strong></p>
                    <ul>
                      <li>Access to academic resources</li>
                      <li>Equipment request capabilities</li>
                      <li>Requires HOD approval for full access</li>
                      <li>Course assignment after approval</li>
                    </ul>
                  </div>
                )}
                {formData.role === 'ADMIN' && (
                  <div>
                    <p><strong>Administrator Role:</strong></p>
                    <ul>
                      <li>Full system access and user management</li>
                      <li>Seat and room management</li>
                      <li>System configuration and maintenance</li>
                      <li>All administrative functions</li>
                    </ul>
                  </div>
                )}
                {formData.role === 'EQUIPMENT_ADMIN' && (
                  <div>
                    <p><strong>Equipment Administrator Role:</strong></p>
                    <ul>
                      <li>Equipment and lab management</li>
                      <li>Course and lab class management</li>
                      <li>Equipment request processing</li>
                      <li>Analytics and reporting</li>
                    </ul>
                  </div>
                )}
                {formData.role === 'HOD' && (
                  <div>
                    <p><strong>Head of Department Role:</strong></p>
                    <ul>
                      <li>Professor approval authority</li>
                      <li>Course approval management</li>
                      <li>Escalated request review</li>
                      <li>Department oversight</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || Object.keys(errors).length > 0}
            >
              {loading ? 'Creating...' : 'Create Staff User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStaffModal;