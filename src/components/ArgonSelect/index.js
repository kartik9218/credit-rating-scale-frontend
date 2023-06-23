
import { forwardRef } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// react-select components
import Select from "react-select";

// Infomerics MUI base styles
import colors from "assets/theme/base/colors";

// Infomerics MUI context
import { useArgonController } from "context";

// Custom styles for ArgonSelect
import styles from "components/ArgonSelect/styles";

const ArgonSelect = forwardRef(({ size, error, isInvalid, isClearable = false ,isDisabled,required , success, ...rest }, ref) => {
  const [controller] = useArgonController();
  const { darkMode } = controller;
  const { light } = colors;
  const customStyles = {
    option: (base, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...base,
        backgroundColor: isFocused ? "#e2e2e2" : isSelected ? "#c2c2c2" : "#ffffff",
        color: isFocused ? "#000000" : "#000000",
    };
  },
  control: (baseStyles, state) => {
    return {
    ...baseStyles,
    borderColor: isInvalid ? '#FF0000' : baseStyles.borderColor,
  }},
};

  return (
    <Select
      {...rest}
      ref={ref}
      required={required}
      isDisabled={isDisabled}
      // styles={styles(size, error, success, darkMode, customStyles)}
      styles={customStyles}
      isClearable={isClearable}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary25: light.main,
          primary: light.main,
        },
      })}
    />
  );
});

// Setting default values for the props of ArgonSelect
ArgonSelect.defaultProps = {
  size: "medium",
  error: false,
  success: false,
  isDisabled: false,
  isInvalid:false,
  required:false
};

// Typechecking props for the ArgonSelect
ArgonSelect.propTypes = {
  isClearable:PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  error: PropTypes.bool,
  success: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isInvalid: PropTypes.bool,
  required: PropTypes.bool,
};

export default ArgonSelect;
