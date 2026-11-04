"use client";

import { Lottie } from "lottie-react";
import botAnimationData from "./bot-animation.json";

export default function LottieRobot({ className }) {
  return (
    <Lottie
      src={botAnimationData}
      loop={true}
      autoplay={true}
      className={className}
    />
  );
}
