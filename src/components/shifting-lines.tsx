import { cellHeight, cellSize, REFRESH_WAIT } from "@constants/global";
import { CSSProperties, FC, useCallback, useRef, useState } from "react";

const RADIUS = 5;

interface IShiftingLines {
  grid: number[][];
  colorSetup: TColorSetup;
}

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

const globalOffset = [20, 20];

const ShiftingLines: FC<IShiftingLines> = ({ grid, colorSetup }) => {
  const [animating, setAnimating] = useState(false);
  const [offsets, setOffsets] = useState(grid.map(() => 0));

  const maxWidth = cellSize * grid[0].length;

  const intervalHandleRef = useRef<NodeJS.Timer | null>(null)
  const handleClick = useCallback(() => {
    if (animating && intervalHandleRef.current) {
      setAnimating(false);
      clearInterval(intervalHandleRef.current);
      return;
    };
    setAnimating(true);

    intervalHandleRef.current = setInterval(() => {
      setOffsets((prev) => prev.map((e, i) => (i % 2 ? e + 1 : e - 1)));
    }, REFRESH_WAIT);
  }, [offsets, animating]);

  return (
    <div onClick={() => handleClick()}>
      <svg
        width={grid[0].length * cellSize + globalOffset[0]}
        height={grid.length * 2 * cellHeight + globalOffset[1]}
      >
        {grid.map((row, y) => {
          return (
            <>
              {row.map((val, x) => {
                const hasRightSibling = siblingExists(grid, x + 1, y);
                const hasLeftSibling = siblingExists(grid, x - 1, y);
                const color = getCellColor(x, y, val, colorSetup);

                const newX =
                  (x * cellSize + globalOffset[0] + offsets[y]) % maxWidth;
                const fill = color === "" ? "white" : color;

                const finalY = 1.5 * y * cellHeight + globalOffset[1];
                const finalX = newX > 0 ? newX : newX + maxWidth;

                if (hasRightSibling && hasLeftSibling) {
                  return (
                    <path
                      d={`
M${finalX - RADIUS},${finalY} 
h${cellSize} 
v${cellHeight} 
h-${cellSize} 
v-${cellHeight} 
z`}
                      fill={fill}
                    />
                  );
                } else if (hasRightSibling) {
                  return (
                    <path
                      d={`
M${finalX},${finalY} 
h${cellSize - RADIUS} 
v${cellHeight} 
h-${cellSize - RADIUS} 
a${RADIUS},${RADIUS} 0 0 1 -${RADIUS},-${RADIUS} 
v-${cellHeight - 2 * RADIUS} 
a${RADIUS},${RADIUS} 0 0 1 ${RADIUS},-${RADIUS} 
z`}
                      fill={fill}
                    />
                  );
                } else if (hasLeftSibling) {
                  return (
                    <path
                      d={`
M${finalX - RADIUS},${finalY} 
h${cellSize - RADIUS} 
a${RADIUS},${RADIUS} 0 0 1 ${RADIUS},${RADIUS} 
v${cellHeight - 2 * RADIUS} 
a${RADIUS},${RADIUS} 0 0 1 -${RADIUS},${RADIUS} 
h-${cellSize - RADIUS} 
v-${cellHeight} 
z`}
                      fill={fill}
                    />
                  );
                } else return null;
              })}
            </>
          );
        })}
      </svg>
    </div>
  );
};

export default ShiftingLines;
