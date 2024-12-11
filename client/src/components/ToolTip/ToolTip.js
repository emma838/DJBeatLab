import React from "react";
import PropTypes from "prop-types";
import styles from "./ToolTip.module.scss";

const Tooltip = ({ className, style, iconColor, bubbleBgColor, title, text, image }) => {
  return (
    <div
      className={`${styles.tooltipContainer} ${className}`}
      style={{ ...style, backgroundColor: bubbleBgColor }}
    >
      <div className={styles.icon} style={{ color: iconColor }}>
        ?
      </div>
      <div className={styles.tooltipBubble}>
        <h4>{title}</h4>
        <p>{text}</p>
        {image && <img src={image} alt={title} />}
      </div>
    </div>
  );
};

Tooltip.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  iconColor: PropTypes.string,
  bubbleBgColor: PropTypes.string,
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  image: PropTypes.string,
};

Tooltip.defaultProps = {
  className: "",
  style: {},
  iconColor: "#000",
  bubbleBgColor: "#fff",
  image: null,
};

export default Tooltip;
