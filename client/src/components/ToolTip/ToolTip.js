import React from "react";
import styles from "./ToolTip.module.scss";
import camelotImg from '../../assets/camelotwheel.png';

// Mapa nazw obrazów do ich importów
const imageMap = {
  camelotImage: camelotImg,
};

const Tooltip = ({
  className = "",
  style = {},
  iconColor = "#000",
  bubbleBgColor = "#fff",
  title,
  text,
  image = null,
  position = "center",
}) => {
  const tooltipPositionStyle =
    position === "left"
      ? { left: "0%", transform: "translateX(0%)" }
      : position === "right"
      ? { left: "100%", transform: "translateX(-100%)" }
      : { left: "50%", transform: "translateX(-50%)" }; // default: center

  // Dynamiczne dopasowanie obrazu na podstawie nazwy przekazanej przez prop
  const imageSrc = image ? imageMap[image] : undefined;

  return (
    <div
      className={`${styles.tooltipContainer} ${className}`}
      style={{ ...style, backgroundColor: bubbleBgColor }}
    >
      <div className={styles.icon} style={{ color: iconColor }}>
        ?
      </div>
      <div className={styles.tooltipBubble} style={tooltipPositionStyle}>
        <div>
          <h4>{title}</h4>
          <p dangerouslySetInnerHTML={{ __html: text }}></p>
        </div>
        {imageSrc && <img src={imageSrc} alt={title} />}
      </div>
    </div>
  );
};

export default Tooltip;