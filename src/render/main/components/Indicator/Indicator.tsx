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
    const [handler, cleaner] = (window as any).indicator.update(
      (indicators: []) => {
        console.log(indicators);
        dispatch(setIndicators(indicators));
      }
    );
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
              visible,
              text,
              subText,
              progress,
            }: {
              id: number;
              visible: boolean;
              text: string;
              subText: string;
              progress?: number;
            }) => {
              if (progress !== undefined) {
                return (
                  <ProgressIndicator
                    key={id}
                    id={id}
                    text={text}
                    subText={subText}
                    visible={visible}
                    progress={progress}
                  />
                );
              }
              return (
                <TextIndicator
                  key={id}
                  id={id}
                  visible={visible}
                  text={text}
                  subText={subText}
                />
              );
            }
          )}
      </div>
    </div>
  );
}
