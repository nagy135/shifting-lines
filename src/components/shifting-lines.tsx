import { CSSProperties, FC } from "react";

interface IShiftingLines {
  grid: number[][];
}

const cellSize = 20;

const style: CSSProperties = {
  position: "absolute",
  backgroundColor: "white",
  width: cellSize,
  height: cellSize,
};

const siblingExists = (grid: number[][], x: number, y: number): boolean => {
  if (grid.length > y) {
    if (grid[0].length > x) {
      if (grid[y][x]) return true;
    }
  }
  return false;
};

const globalOffset = [40, 40];

const ShiftingLines: FC<IShiftingLines> = ({ grid }) => {
  return (
    <div className="app">
      {grid.map((row, y) => {
        return (
          <>
            {row.map((val, x) => {
              const hasRightSibling = siblingExists(grid, x + 1, y);
              const hasLeftSibling = siblingExists(grid, x - 1, y);
              const color = val ? val == 1 ? 'red' : 'green' : ''
              return (
                <div
                  key={`cell-${x}-${y}`}
                  style={{
                    ...style,
                    top: y * cellSize + cellSize * y + globalOffset[1],
                    left: x * cellSize + globalOffset[0],
                    borderTopLeftRadius: !hasLeftSibling ? 15 : undefined,
                    borderBottomLeftRadius: !hasLeftSibling ? 15 : undefined,

                    borderTopRightRadius: !hasRightSibling ? 15 : undefined,
                    borderBottomRightRadius: !hasRightSibling ? 15 : undefined,
                    background: color,
                  }}
                />
              );
            })}
          </>
        );
      })}
    </div>
  );
};

export default ShiftingLines;
