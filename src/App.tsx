import React, { useState, useEffect } from 'react';
import './App.css';

type Position = {
  rowIndex: number,
  columnIndex: number
}

const BOARD_SIZE = 10;
enum COLORS {
  RED = '#ff0000',
  WHITE = '#fff',
  GREEN = '#00ff00',
  ORANGE = '#FFA500',
}

const board = new Array(BOARD_SIZE).fill(new Array(BOARD_SIZE).fill(0));

function App() {
  const [knightIndex, setKnightIndex] = useState<number>();
  const [openMoveIndexes, setOpenMoveIndexes] = useState<number[]>([]);
  const [blockerIndexes, setBlockerIndexes] = useState<number[]>([]);

  useEffect(() => {
    knightIndex && setOpenMoveIndexes(calcAvailablePositions({ position: getPositionFromIndex(knightIndex), blockerIndexes }));
  }, [knightIndex, blockerIndexes])

  const handlePositionClick = (position: Position) => {
    const clickedIndex = getIndexFromPosition(position);

    if (blockerIndexes.includes(clickedIndex)) return;
    if (blockerIndexes.map(index => getSurroundingSquares(index)).flat(2)?.includes(clickedIndex)) return;

    if (!knightIndex || (clickedIndex !== knightIndex && openMoveIndexes?.includes(clickedIndex))) {
      setKnightIndex(clickedIndex);
    }
  }

  const toggleBlocker = (position: Position) => {
    const clickedIndex = getIndexFromPosition(position);

    if (blockerIndexes.includes(clickedIndex)) return setBlockerIndexes(blockerIndexes.filter(i => i !== clickedIndex));

    if (clickedIndex === knightIndex) return;
    if (knightIndex && getSurroundingSquares(knightIndex).includes(clickedIndex)) return;
    if (blockerIndexes.map(index => getSurroundingSquares(index)).flat(2)?.includes(clickedIndex)) return;

    setBlockerIndexes([...blockerIndexes, clickedIndex]);
  }

  const getSquareColorByIndex = (index: number) => {
    const { rowIndex, columnIndex } = getPositionFromIndex(index);
    
    if (blockerIndexes.map(index => getSurroundingSquares(index)).flat(2)?.includes(index)) return COLORS.ORANGE;
    if (openMoveIndexes?.includes(index)) return COLORS.GREEN;
  
    let color: string;
    if (rowIndex % 2 === 0) {
      color = (columnIndex % 2 === 0) ? COLORS.WHITE : COLORS.RED;
    } else {
      color = (columnIndex % 2 === 0) ? COLORS.RED : COLORS.WHITE;
    }
  
    return color;
  }

  return (
    <div className="App">
      <div className="pageWrap">
        <div className='instructions'>
          <h1>Audentio Code Challenge</h1>
          <p>- Click to set the starting position of the knight.</p>
          <p>- Left click to set a blocker object and right click on the blocker to remove it.</p>
        </div>
        <div className='board'>
          {
            board.map((row: [], i) =>
              <div key={`row-${i}`} style={{ display: 'flex' }}>
                {
                  row.map((column, n) => {
                    const currentPosition: Position = { rowIndex: i, columnIndex: n };
                    const currentIndex = getIndexFromPosition({ rowIndex: i, columnIndex: n });

                    return (
                      <div 
                        key={`position-${currentIndex}`}
                        className='square'
                        style={{
                          backgroundColor: getSquareColorByIndex(currentIndex),
                        }}
                        onClick={() => handlePositionClick(currentPosition)}
                        onContextMenu={(e) => { e.preventDefault(); toggleBlocker(currentPosition); }}
                      >
                        {knightIndex === currentIndex && '*'}
                        {blockerIndexes.includes(currentIndex) && '#'}
                      </div>
                    )
                  })
                }
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

// These would most likely be imported from a util file or something similar
const getPositionFromIndex = (index: number): Position => {
  return {
    rowIndex: Math.trunc(index / BOARD_SIZE),
    columnIndex: index % BOARD_SIZE
  };
}

const getIndexFromPosition = ({ rowIndex, columnIndex }: Position) => {
  return (rowIndex * BOARD_SIZE) + columnIndex;
}

// returns an array of closest squares from square
const getSurroundingSquares = (index: number) => {
  const { rowIndex, columnIndex } = getPositionFromIndex(index);
  const surroundingSquares = [];

  const offsets = [-1, 0, 1];

  for (let surroundingRowIndex of offsets) {
    for (let surroundingColumnIndex of offsets) {
      const surroundingSqaurePosition = {
        rowIndex: rowIndex + surroundingRowIndex,
        columnIndex: columnIndex + surroundingColumnIndex
      }
      debugger;

      const surroundingSquareIndex = getIndexFromPosition(surroundingSqaurePosition);

      if (surroundingSquareIndex === index) continue;
      if (surroundingSqaurePosition.rowIndex < 0 || surroundingSqaurePosition.rowIndex >= BOARD_SIZE) continue;
      if (surroundingSqaurePosition.columnIndex < 0 || surroundingSqaurePosition.columnIndex >= BOARD_SIZE) continue;

      surroundingSquares.push(surroundingSquareIndex);
    }
  }

  return surroundingSquares;
}

const calcAvailablePositions = ({ position, blockerIndexes }: { position: Position, blockerIndexes: number[] }): number[] => {
  const MAX_POSSIBLE_MOVES = 8;
  const availableMoves: number[] = [];
  const { rowIndex, columnIndex } = position;

  // define all possible moves for knight both columns and rows
  let possibleXMoves = [2, 2, 1, 1, -1, -1, -2, -2];
  let possibleYMoves = [1, -1, 2, -2, 2, -2, 1, -1];
  
  // loop over 8 potential moves.
  for (let i=0; i<=MAX_POSSIBLE_MOVES; i++) {
    let columnPosition = columnIndex + possibleXMoves[i];
    let rowPosition = rowIndex + possibleYMoves[i];

    const positionIndex = getIndexFromPosition({ rowIndex: rowPosition, columnIndex: columnPosition });

    if (rowPosition < 0 || rowPosition >= BOARD_SIZE) continue;
    if (columnPosition < 0 || columnPosition >= BOARD_SIZE) continue;
    if (blockerIndexes.includes(positionIndex)) continue;
    if (blockerIndexes.map(index => getSurroundingSquares(index)).flat(2)?.includes(positionIndex)) continue;

    // if we made it past the preious checks add the index to the array
    availableMoves.push(positionIndex);
  }

  return availableMoves;
}

export default App;
