import ArgonTypography from "components/ArgonTypography";
import PropTypes from "prop-types";

const ErrorTemplate = (props) => {
    const { message } = props;
    return <ArgonTypography
    component="label"
    variant="caption"
    fontWeight="bold"
    textTransform="capitalize"
    // position="absolute"
    style={{color: "red"}}
    >{message}</ArgonTypography>
}

export default ErrorTemplate;
  
ErrorTemplate.propTypes = {
    message: PropTypes.string,
}