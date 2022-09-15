import { CSSProperties, FC } from "react";

interface IShiftingLines {
  grid: number[][];
  colorSetup: TColorSetup;
}

const cellSize = 20;

const style: CSSProperties = {
  position: "absolute",
  backgroundColor: "white",
  width: cellSize,
  height: cellSize,
};

export type TColorSetup = {
  baseChoices: string[];
  backgroundLines: string;
  background: string;
};

const siblingExists = (grid: number[][], x: number, y: number): boolean => {
  if (grid.length > y) {
    if (grid[0].length > x) {
      if (grid[y][x]) return true;
    }
  }
  return false;
};

const colorCache: Record<string, string> = {};
const getCellColor = (
  x: number,
  y: number,
  val: number,
  colorSetup: TColorSetup
): string => {
  if (val == 0) return "";
  if (val == 2) return colorSetup.backgroundLines;

  const leftSiblingIndex = `${x - 1}x${y}`;
  const rightSiblingIndex = `${x + 1}x${y}`;

  const colorChoice =
    leftSiblingIndex in colorCache
      ? colorCache[leftSiblingIndex]
      : rightSiblingIndex in colorCache
      ? colorCache[rightSiblingIndex]
      : colorSetup.baseChoices[
          Math.floor(Math.random() * colorSetup.baseChoices.length)
        ];
  colorCache[`${x}x${y}`] = colorChoice;
  return colorChoice;
};

const globalOffset = [40, 40];

const ShiftingLines: FC<IShiftingLines> = ({ grid, colorSetup }) => {
  return (
    <div
      className="app"
      style={{
        backgroundColor: colorSetup.background,
        width: grid[0].length * cellSize + globalOffset[0],
        height: grid.length * 2 * cellSize + globalOffset[1],
      }}
    >
      {grid.map((row, y) => {
        return (
          <>
            {row.map((val, x) => {
              const hasRightSibling = siblingExists(grid, x + 1, y);
              const hasLeftSibling = siblingExists(grid, x - 1, y);
              const color = getCellColor(x, y, val, colorSetup);

              return (
                <div
                  key={`cell-${x}x${y}`}
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
