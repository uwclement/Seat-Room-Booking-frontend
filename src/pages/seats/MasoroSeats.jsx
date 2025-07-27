import React, { useState, useEffect } from 'react';
import { getAllSeatsInMasoro, findAvailableSeats, toggleFavoriteSeat, getFavoriteSeats } from '../../api/seat';
import { getUserActiveBookings } from '../../api/booking';
import { createBooking } from '../../api/booking';
import { joinWaitlist } from '../../api/waitlist';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import SeatGrid from '../../components/seats/MasoroSeatGrid';
import SeatDetailsModal from '../../components/seats/SeatDetailsModal';
import ScheduleStatusBanner from '../../components/admin/ScheduleManagement/ScheduleStatusBanner';
import './Seats.css';

const SeatsPage = () => {
  const [seats, setSeats] = useState([]);
  const [filteredSeats, setFilteredSeats] = useState([]);
  const [favoriteSeats, setFavoriteSeats] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nearbySeats, setNearbySeats] = useState([]);
  const [activeFloor, setActiveFloor] = useState(1);
  const [filters, setFilters] = useState({
    floor: 'ALL',
    zoneType: 'ALL',
    timeRange: 'ALL',
    hasDesktop: false,
    date: new Date().toISOString().split('T')[0],
    showOnlyAvailable: false
  });

  // Fetch seats on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [seatsData, favoritesData, userBookingsData] = await Promise.all([
          getAllSeatsInMasoro(),
          getFavoriteSeats(),
          getUserActiveBookings()
        ]);
        
        // Enhance seats with booking information and floor data
        const enhancedSeats = seatsData.map(seat => {
          const relatedBookings = userBookingsData.filter(
            booking => booking.seatId === seat.id
          );
          
          return {
            ...seat,
            bookings: relatedBookings.length > 0 ? relatedBookings : [],
            isDisabled: seat.isDisabled || false,
            available: seat.available !== undefined ? seat.available : 
                     !relatedBookings.some(b => 
                       b.status === 'RESERVED' || b.status === 'CHECKED_IN'),
            // Ensure floor is set (default to 1 if not specified)
            floor: seat.floor || 1
          };
        });
        
        setSeats(enhancedSeats);
        setFilteredSeats(enhancedSeats);
        setFavoriteSeats(favoritesData.map(seat => seat.id));
        setUserBookings(userBookingsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load seats. Please try again later.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };
  
    fetchData();
  }, []);

  // Apply filters
  const applyFilters = async () => {
    try {
      setLoading(true);
      
      let filtered = [...seats];
      
      // Filter by floor
      if (filters.floor !== 'ALL') {
        filtered = filtered.filter(seat => seat.floor === parseInt(filters.floor));
      }
      
      // Filter by zone type
      if (filters.zoneType !== 'ALL') {
        filtered = filtered.filter(seat => seat.zoneType === filters.zoneType);
      }
      
      // Filter by desktop requirement
      if (filters.hasDesktop) {
        filtered = filtered.filter(seat => seat.hasDesktop);
      }
      
      // Filter by availability
      if (filters.showOnlyAvailable) {
        filtered = filtered.filter(seat => 
          !seat.isDisabled && !seat.bookings?.some(booking => 
            booking.status === 'RESERVED' || booking.status === 'CHECKED_IN'
          )
        );
      }

      // For time-based filtering, use API if needed
      if (filters.timeRange !== 'ALL') {
        const filterData = {
          floor: filters.floor !== 'ALL' ? parseInt(filters.floor) : null,
          zoneType: filters.zoneType !== 'ALL' ? filters.zoneType : null,
          hasDesktop: filters.hasDesktop || null,
          date: filters.date,
          startTime: null,
          endTime: null,
          showOnlyAvailable: filters.showOnlyAvailable
        };

        if (filters.timeRange === 'MORNING') {
          filterData.startTime = '08:00';
          filterData.endTime = '12:00';
        } else if (filters.timeRange === 'AFTERNOON') {
          filterData.startTime = '12:00';
          filterData.endTime = '17:00';
        } else if (filters.timeRange === 'EVENING') {
          filterData.startTime = '17:00';
          filterData.endTime = '22:00';
        }

        const availableSeats = await findAvailableSeats(filterData);
        setFilteredSeats(availableSeats);
      } else {
        setFilteredSeats(filtered);
      }
    } catch (err) {
      setError('Failed to apply filters. Please try again.');
      console.error('Error applying filters:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFilters = {
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    };
    
    setFilters(newFilters);
    
    // Auto-switch active floor when floor filter changes
    if (name === 'floar' && value !== 'ALL') {
      setActiveFloor(parseInt(value));
    }
  };

  // Handle floor tab switching
  const handleFloorSwitch = (floorNumber) => {
    setActiveFloor(floorNumber);
    setFilters(prev => ({ ...prev, floor: floorNumber.toString() }));
  };

  // Get seats for Floor 1 (all seats together)
  const getFloor1Seats = () => {
    return filteredSeats.filter(seat => seat.floar === 1);
  };

  // Get seats for Floor 2 Desktop section
  const getFloor2DesktopSeats = () => {
    return filteredSeats.filter(seat => 
      seat.floar === 2 && seat.hasDesktop
    );
  };

  // Get seats for Floor 2 Other section (non-desktop)
  const getFloor2OtherSeats = () => {
    return filteredSeats.filter(seat => 
      seat.floar === 2 && !seat.hasDesktop
    );
  };

  // Find nearby seats for recommendations
  const findNearbySeats = (seat) => {
    if (!seat || !seats.length) return [];
    
    // Filter seats on the same floor
    const sameFloorSeats = seats.filter(s => s.floor === seat.floor);
    
    let rowLetter, seatNumber;
    
    if (seat.seatNumber.includes('-')) {
      const parts = seat.seatNumber.split('-');
      rowLetter = parts[0];
      seatNumber = parseInt(parts[1]);
    } else {
      rowLetter = seat.seatNumber.charAt(0);
      seatNumber = parseInt(seat.seatNumber.substring(1));
    }
    
    const availableSeats = sameFloorSeats.filter(s => 
      !s.isDisabled && 
      !s.bookings?.some(booking => 
        booking.status === 'RESERVED' || booking.status === 'CHECKED_IN'
      ) &&
      s.zoneType === seat.zoneType
    );
    
    let nearbySeats = [];
    
    if (seat.seatNumber.includes('-')) {
      nearbySeats = availableSeats.filter(s => {
        if (!s.seatNumber.includes('-')) return false;
        
        const parts = s.seatNumber.split('-');
        const sRow = parts[0];
        
        return sRow.charAt(0) === rowLetter.charAt(0) || 
              (rowLetter.startsWith('L') && sRow.startsWith('R')) ||
              (rowLetter.startsWith('R') && sRow.startsWith('L'));
      });
    } else {
      nearbySeats = availableSeats.filter(s => {
        if (s.seatNumber.includes('-')) return false;
        
        const sRow = s.seatNumber.charAt(0);
        
        return sRow === rowLetter || 
              (sRow.charCodeAt(0) === rowLetter.charCodeAt(0) + 1) ||
              (sRow.charCodeAt(0) === rowLetter.charCodeAt(0) - 1);
      });
    }
    
    return nearbySeats.sort((a, b) => {
      const aRow = a.seatNumber.charAt(0);
      const bRow = b.seatNumber.charAt(0);
      
      if (aRow === rowLetter && bRow !== rowLetter) {
        return -1;
      }
      if (bRow === rowLetter && aRow !== rowLetter) {
        return 1;
      }
      
      if (!a.seatNumber.includes('-') && !b.seatNumber.includes('-')) {
        const aNum = parseInt(a.seatNumber.substring(1));
        const bNum = parseInt(b.seatNumber.substring(1));
        return Math.abs(aNum - seatNumber) - Math.abs(bNum - seatNumber);
      }
      
      return 0;
    }).slice(0, 6);
  };

  // Handle seat selection
  const handleSeatSelect = (seat) => {
    setSelectedSeat(seat);
    const nearby = findNearbySeats(seat);
    setNearbySeats(nearby);
    setShowModal(true);
  };

  // Toggle favorite seat
  const handleToggleFavorite = async (seatId) => {
    try {
      await toggleFavoriteSeat(seatId);
      
      if (favoriteSeats.includes(seatId)) {
        setFavoriteSeats(favoriteSeats.filter(id => id !== seatId));
      } else {
        setFavoriteSeats([...favoriteSeats, seatId]);
      }
    } catch (err) {
      setError('Failed to update favorite status.');
      console.error('Error toggling favorite:', err);
    }
  };

  // Book a seat
  const handleBookSeat = async (bookingData) => {
    try {
      const response = await createBooking(bookingData);
      
      const updatedBookings = await getUserActiveBookings();
      setUserBookings(updatedBookings);
      
      setShowModal(false);
      
      const updatedSeats = await getAllSeatsInMasoro();
      const enhancedSeats = updatedSeats.map(seat => ({
        ...seat,
        floor: seat.floor || 1
      }));
      setSeats(enhancedSeats);
      setFilteredSeats(enhancedSeats);

      return { success: true, message: 'Booking successful!' };
    } catch (err) {
      console.error('Error booking seat:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to book seat. Please try again.' 
      };
    }
  };

  // Join waitlist
  const handleJoinWaitlist = async (waitlistData) => {
    try {
      const response = await joinWaitlist(waitlistData);
      setShowModal(false);
      return { success: true, message: 'Added to waitlist successfully!' };
    } catch (err) {
      console.error('Error joining waitlist:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to join waitlist. Please try again.' 
      };
    }
  };

  return (
    <div className="seat-page-container">
      <div className="container">
        <ScheduleStatusBanner location="MASORO" />
        <div className="content-header">
          <h2>Masoro Seats</h2>
          <div className="filters">
            <select 
              className="filter-select"
              name="floor"
              value={filters.floor}
              onChange={handleFilterChange}
            >
              <option value="ALL">All Floors</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
            </select>
            

            <select 
              className="filter-select"
              name="timeRange"
              value={filters.timeRange}
              onChange={handleFilterChange}
            >
              <option value="ALL">All Times</option>
              <option value="MORNING">Morning (8AM - 12PM)</option>
              <option value="AFTERNOON">Afternoon (12PM - 5PM)</option>
              <option value="EVENING">Evening (5PM - 10PM)</option>
            </select>
            
            <div className="filter-checkbox">
              <input
                type="checkbox"
                id="hasDesktop"
                name="hasDesktop"
                checked={filters.hasDesktop}
                onChange={handleFilterChange}
              />
              <label htmlFor="hasDesktop">Desktop Computer</label>
            </div>
            
            <div className="filter-checkbox">
              <input
                type="checkbox"
                id="showOnlyAvailable"
                name="showOnlyAvailable"
                checked={filters.showOnlyAvailable}
                onChange={handleFilterChange}
              />
              <label htmlFor="showOnlyAvailable">Only Available Seats</label>
            </div>
            
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="filter-date"
              min={new Date().toISOString().split('T')[0]}
            />
            
            <Button 
              variant="primary"
              onClick={applyFilters}
              className="filter-button"
            >
              Apply Filters
            </Button>
          </div>
        </div>

        {error && (
          <Alert
            type="danger"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="seat-container">
            {/* Floor Navigation Tabs */}
            <div className="floor-tabs">
              <button 
                className={`floor-tab ${activeFloor === 1 ? 'active' : ''}`}
                onClick={() => handleFloorSwitch(1)}
              >
                Floor 1
              </button>
              <button 
                className={`floor-tab ${activeFloor === 2 ? 'active' : ''}`}
                onClick={() => handleFloorSwitch(2)}
              >
                Floor 2
              </button>
            </div>

            <div className="legend">
              <div className="legend-item">
                <div className="seat-icon available"></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="seat-icon occupied"></div>
                <span>Occupied</span>
              </div>
              <div className="legend-item">
                <div className="seat-icon fas fa-bookmark"></div>
                <span>Favorite</span>
              </div>
            </div>

            {/* Floor 1 - All Seats Together */}
            {activeFloor === 1 && (
              <div className="floor-content">
                <h3 className="section-title">All Seats</h3>
                <SeatGrid 
                  seats={getFloor1Seats()}
                  onSeatSelect={handleSeatSelect}
                  favoriteSeats={favoriteSeats}
                  userBookings={userBookings}
                  seatsPerRow={6}
                />
              </div>
            )}

            {/* Floor 2 - Two Sections */}
            {activeFloor === 2 && (
              <div className="floor-content">
                {/* Desktop Section */}
                {getFloor2DesktopSeats().length > 0 && (
                  <>
                    <h3 className="section-title">Laptop Work Space</h3>
                    <SeatGrid 
                      seats={getFloor2DesktopSeats()}
                      onSeatSelect={handleSeatSelect}
                      favoriteSeats={favoriteSeats}
                      userBookings={userBookings}
                      seatsPerRow={6}
                    />
                  </>
                )}

                {/* Other Seats Section */}
                {getFloor2OtherSeats().length > 0 && (
                  <>
                    <h3 className="section-title">Seats</h3>
                    <SeatGrid 
                      seats={getFloor2OtherSeats()}
                      onSeatSelect={handleSeatSelect}
                      favoriteSeats={favoriteSeats}
                      userBookings={userBookings}
                      seatsPerRow={6}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {showModal && selectedSeat && (
          <SeatDetailsModal
            seat={selectedSeat}
            onClose={() => setShowModal(false)}
            onBook={handleBookSeat}
            onWaitlist={handleJoinWaitlist}
            onToggleFavorite={() => handleToggleFavorite(selectedSeat.id)}
            isFavorite={favoriteSeats.includes(selectedSeat.id)}
            userBookings={userBookings}
            nearbySeats={nearbySeats}
            onSeatSelect={handleSeatSelect}
          />
        )}
      </div>
    </div>
  );
};

export default SeatsPage;