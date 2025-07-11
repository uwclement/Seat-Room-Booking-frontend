import React, { useState, useEffect } from 'react';
import { getAllSeatsInGishushu, findAvailableSeats, toggleFavoriteSeat, getFavoriteSeats } from '../../api/seat';
import { getUserActiveBookings } from '../../api/booking';
import { createBooking } from '../../api/booking';
import { joinWaitlist } from '../../api/waitlist';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import SeatGrid from '../../components/seats/SeatGrid';
import CollaborationArea from '../../components/seats/CollaborationArea';
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
  const [filters, setFilters] = useState({
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
          getAllSeatsInGishushu(),
          getFavoriteSeats(),
          getUserActiveBookings()
        ]);
        
        // Enhance seats with booking information consistently
        const enhancedSeats = seatsData.map(seat => {
          // Check if the seat has any active bookings
          const relatedBookings = userBookingsData.filter(
            booking => booking.seatId === seat.id
          );
          
          return {
            ...seat,
            // Add the bookings array that all components expect
            bookings: relatedBookings.length > 0 ? relatedBookings : [],
            // Make sure isDisabled is defined
            isDisabled: seat.isDisabled || false,
            // Make sure the available property is consistent with bookings
            available: seat.available !== undefined ? seat.available : 
                     !relatedBookings.some(b => 
                       b.status === 'RESERVED' || b.status === 'CHECKED_IN')
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
      
      // If we're just using local filters (showing only available)
      if (filters.showOnlyAvailable && filters.zoneType === 'ALL' && filters.timeRange === 'ALL' && !filters.hasDesktop) {
        const availableSeats = seats.filter(seat => 
          !seat.isDisabled && !seat.bookings?.some(booking => 
            booking.status === 'RESERVED' || booking.status === 'CHECKED_IN'
          )
        );
        setFilteredSeats(availableSeats);
        setLoading(false);
        return;
      }
      
      // If no specific filters, just use all seats
      if (filters.zoneType === 'ALL' && filters.timeRange === 'ALL' && !filters.hasDesktop && !filters.showOnlyAvailable) {
        setFilteredSeats(seats);
        setLoading(false);
        return;
      }

      // Prepare filter data for API
      const filterData = {
        zoneType: filters.zoneType !== 'ALL' ? filters.zoneType : null,
        hasDesktop: filters.hasDesktop || null,
        date: filters.date,
        startTime: null,
        endTime: null,
        showOnlyAvailable: filters.showOnlyAvailable
      };

      // Set time ranges based on selection
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
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Find nearby seats for recommendations
  const findNearbySeats = (seat) => {
    if (!seat || !seats.length) return [];
    
    // Extract row letter and seat number (e.g., "A1" -> row "A", number 1)
    let rowLetter, seatNumber;
    
    // Handle different seat numbering formats
    if (seat.seatNumber.includes('-')) {
      // For collaboration area (e.g., "L1-2")
      const parts = seat.seatNumber.split('-');
      rowLetter = parts[0];
      seatNumber = parseInt(parts[1]);
    } else {
      // For regular seats (e.g., "A1")
      rowLetter = seat.seatNumber.charAt(0);
      seatNumber = parseInt(seat.seatNumber.substring(1));
    }
    
    // Find only available seats in same area
    const availableSeats = seats.filter(s => 
      !s.isDisabled && 
      !s.bookings?.some(booking => 
        booking.status === 'RESERVED' || booking.status === 'CHECKED_IN'
      ) &&
      s.zoneType === seat.zoneType
    );
    
    // Define nearby seats based on numbering pattern
    let nearbySeats = [];
    
    if (seat.seatNumber.includes('-')) {
      // For collaboration area, find seats in the same table or adjacent tables
      nearbySeats = availableSeats.filter(s => {
        if (!s.seatNumber.includes('-')) return false;
        
        const parts = s.seatNumber.split('-');
        const sRow = parts[0];
        const sNum = parseInt(parts[1]);
        
        // Seats in the same table or adjacent tables
        return sRow.charAt(0) === rowLetter.charAt(0) || 
              (rowLetter.startsWith('L') && sRow.startsWith('R')) ||
              (rowLetter.startsWith('R') && sRow.startsWith('L'));
      });
    } else {
      // For regular seats, find seats in the same row or adjacent rows
      nearbySeats = availableSeats.filter(s => {
        if (s.seatNumber.includes('-')) return false;
        
        const sRow = s.seatNumber.charAt(0);
        const sNum = parseInt(s.seatNumber.substring(1));
        
        // Same row or adjacent rows
        return sRow === rowLetter || 
              (sRow.charCodeAt(0) === rowLetter.charCodeAt(0) + 1) ||
              (sRow.charCodeAt(0) === rowLetter.charCodeAt(0) - 1);
      });
    }
    
    // Sort by proximity (same row first, then by seat number difference)
    return nearbySeats.sort((a, b) => {
      const aRow = a.seatNumber.charAt(0);
      const bRow = b.seatNumber.charAt(0);
      
      // First compare rows
      if (aRow === rowLetter && bRow !== rowLetter) {
        return -1;
      }
      if (bRow === rowLetter && aRow !== rowLetter) {
        return 1;
      }
      
      // Then compare seat numbers for regular seats
      if (!a.seatNumber.includes('-') && !b.seatNumber.includes('-')) {
        const aNum = parseInt(a.seatNumber.substring(1));
        const bNum = parseInt(b.seatNumber.substring(1));
        return Math.abs(aNum - seatNumber) - Math.abs(bNum - seatNumber);
      }
      
      return 0;
    }).slice(0, 6); // Limit to 6 recommendations
  };

  // Handle seat selection
  const handleSeatSelect = (seat) => {
    setSelectedSeat(seat);
    
    // Find nearby seats for recommendations
    const nearby = findNearbySeats(seat);
    setNearbySeats(nearby);
    
    setShowModal(true);
  };

  // Toggle favorite seat
  const handleToggleFavorite = async (seatId) => {
    try {
      await toggleFavoriteSeat(seatId);
      
      // Update local state
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
      
      // Update user bookings after successful booking
      const updatedBookings = await getUserActiveBookings();
      setUserBookings(updatedBookings);
      
      // Close modal and update UI
      setShowModal(false);
      
      // Refresh seat data
      const updatedSeats = await getAllSeatsInGishushu();
      setSeats(updatedSeats);
      setFilteredSeats(updatedSeats);

     

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
        <ScheduleStatusBanner />
        <div className="content-header">
          <h2>Gishushu Seats</h2>
          <div className="filters">
            <select 
              className="filter-select"
              name="zoneType"
              value={filters.zoneType}
              onChange={handleFilterChange}
            >
              <option value="ALL">All Zones</option>
              <option value="SILENT">Silent Zone</option>
              <option value="COLLABORATION">Collaboration Zone</option>
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
                <div className="seat-icon fas fa-bookmark "></div>
                <span>Favorite</span>
              </div>
            </div>

            <h3 className="section-title">Individual Study Area</h3>
            <SeatGrid 
              seats={filteredSeats.filter(seat => seat.zoneType.includes('SILENT'))}
              onSeatSelect={handleSeatSelect}
              favoriteSeats={favoriteSeats}
              userBookings={userBookings}
            />

            <h3 className="section-title">Collaboration Area</h3>
            <CollaborationArea 
              seats={filteredSeats.filter(seat => seat.zoneType.includes('COLLABORATION'))}
              onSeatSelect={handleSeatSelect}
              favoriteSeats={favoriteSeats}
              userBookings={userBookings}
            />
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