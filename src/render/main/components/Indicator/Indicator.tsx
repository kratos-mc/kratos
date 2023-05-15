import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../stores/RenderStore";
import { setIndicators } from "../../slices/IndicatorSlice";
import TextIndicator from "./TextIndicator";
import ProgressIndicator from "./ProgressIndicator";

export default function Indicator() {
  const { indicators } = useSelector((state: RootState) => state.indicators);
  const dispatch = useDispatch();

  useEffect(() => {
    const { listener: handler, cleaner } = (
      window as any
    ).indicator.handleUpdate((indicators: []) => {
      console.log(`Updating indicators: `, indicators);
      dispatch(setIndicators(indicators));
    });
    handler();

    return () => {
      cleaner();
    };
  }, []);

  return (
    <div>
      <div>
        {indicators &&
          indicators.length > 0 &&
          indicators.map(
            ({
              id,
              isVisible,
              text,
              subText,
              progress,
            }: {
              id: number;
              isVisible: boolean;
              text: string;
              subText: string;
              progress?: number;
            }) => {
              if (progress !== undefined) {
                return isVisible ? (
                  <ProgressIndicator
                    key={id}
                    id={id}
                    text={text}
                    subText={subText}
                    visible={isVisible}
                    progress={progress}
                  />
                ) : null;
              }
              return isVisible ? (
                <TextIndicator
                  key={id}
                  id={id}
                  visible={isVisible}
                  text={text}
                  subText={subText}
                />
              ) : null;
            }
          )}
      </div>
    </div>
  );
}
