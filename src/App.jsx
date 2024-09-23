import './App.css';
import { useCallback, useEffect, useState } from 'react';
import screen from './assets/hall.jpg'

const seats = [
  {
    type: 'CLASSIC',
    price: 500,
    arrangements: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]
  },
  {
    type: 'PRIME',
    price: 300,
    arrangements: [
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1],
    ]
  }
];

const SeatArrangements = ({ seats }) => {
  const [seatCount, setSeatCount] = useState(0);
  const [hallLayout, setLayout] = useState({});
  const [bookedSeat, updateSelectedSeats] = useState({
    type: '',
    selectedSeats: [],
  });
  const [totalPrice, setTotalPrice] = useState(0);

  const handleSeatCount = useCallback((event) => {
    if (event.target.value <= 10) {
      setSeatCount(event.target.value);
    }
  }, []);

  const resetSeats = () => {
    updateSelectedSeats({ type: '', selectedSeats: [] });
    setLayout(seats.reduce((acc, item) => {
      // Reset all seat arrangements to their original state (1 or 0)
      const resetArrangement = item.arrangements.map(row => row.map(seat => (seat === -2 ? 1 : seat)));
      acc[item.type] = { ...item, arrangements: resetArrangement };
      return acc;
    }, {}));
  };

  const checkIfAllSeatsAreAvailable = (type, rowIdx, colIdx) => {
    const row = hallLayout[type].arrangements[rowIdx];
    const allPossibleCol = row.slice(colIdx, colIdx + Math.min(row.length, seatCount));
    return !allPossibleCol.find(item => item === -1);
  };

  const handleSeatBooking = useCallback((rowIndex, colIndex, type) => () => {
    if (!seatCount) return;

    const bookedLength = bookedSeat.selectedSeats.length;
    if (bookedLength < seatCount && (!bookedSeat.type || bookedSeat.type === type)) {
      let selectedSeats;
      updateSelectedSeats(s => {
        selectedSeats = [...s.selectedSeats];
        const alreadyPresentIndex = s.selectedSeats.findIndex((item) => item[0] === rowIndex && item[1] === colIndex);
        if (alreadyPresentIndex === -1) {
          if (checkIfAllSeatsAreAvailable(type, rowIndex, colIndex) && !bookedSeat.selectedSeats.length) {
            for (let i = 0; i < seatCount; i++) {
              selectedSeats = [...selectedSeats, [rowIndex, colIndex + i]];
            }
          } else {
            selectedSeats = [...selectedSeats, [rowIndex, colIndex]];
          }
        } else {
          selectedSeats.splice(alreadyPresentIndex, 1);
        }
        return {
          ...s,
          type,
          selectedSeats,
        };
      });

      setLayout(s => {
        const newArrangement = [...s[type].arrangements];
        if (checkIfAllSeatsAreAvailable(type, rowIndex, colIndex) && !bookedLength) {
          for (let i = 0; i < seatCount; i++) {
            newArrangement[rowIndex][colIndex + i] = -2;
          }
        } else {
          const alreadyPresentIndex = bookedSeat.selectedSeats.findIndex((item) => item[0] === rowIndex && item[1] === colIndex);
          newArrangement[rowIndex][colIndex] = alreadyPresentIndex === -1 ? -2 : 1;
        }
        return {
          ...s,
          [type]: {
            ...s[type],
            arrangements: newArrangement,
          },
        };
      });

      const price = seats.find(seat => seat.type === type).price;
      setTotalPrice(selectedSeats.length * price);
    }
  }, [seatCount, bookedSeat, seats]);

  useEffect(() => {
    const layout = seats.reduce((acc, item) => {
      acc[item.type] = { ...item };
      return acc;
    }, {});
    setLayout(layout);
  }, [seats]);

  const renderSeats = (row, rowIndex, type) => {
    return row.map((seat, i) => (
      <div
        key={`${rowIndex}-${i}`}
        className={`seat ${seat ? (seat < 0 ? (seat === -2 ? 'user-booked' : 'booked') : 'allowed') : 'not-allowed'}`}
        onClick={handleSeatBooking(rowIndex, i, type)}
      >
        {i + 1}
      </div>
    ));
  };

  const renderSeatArrangements = (layout, type) => {
    return layout.map((row, i) => (
      <div className="row" key={i}>
        {renderSeats(row, i, type)}
      </div>
    ));
  };

  const renderInput = () => (
    <input
      type="number"
      onChange={handleSeatCount}
      placeholder="Enter seat count"
    />
  );

  const renderLayout = () => {
    return seats.map((layout) => (
      <div className="layout" key={layout.type}>
        <div className="detail">{layout.type} - {layout.price}</div>
        {hallLayout[layout.type] ? renderSeatArrangements(hallLayout[layout.type].arrangements, layout.type) : ''}
      </div>
    ));
  };

  return (
    <>
       <div className="screen">
    <img src={screen} alt="Movie Screen" className='movie_image' />
  </div>
  <p>All Eyes This Way Please</p>
  {renderInput()}
  {renderLayout()}
  <div className="summary">
    {bookedSeat.selectedSeats.length > 0 && (
      <p>You have selected {bookedSeat.selectedSeats.length} seat(s)</p>
    )}
  </div>
  <button className="reset-button" onClick={resetSeats}>Reset Seats</button>
    </>
  );
};

function App() {
  return (
    <div className="App">
      <h1>Seat Booking</h1>
      <SeatArrangements seats={seats} />
    </div>
  );
}

export default App;
