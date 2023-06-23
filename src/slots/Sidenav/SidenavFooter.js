import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import infomerics_logo from "assets/images/infomerics_logo.svg";
function SidenavFooter() {
  const { REACT_APP_BUILD_VERSION:BUILD_VERSION } = process.env;
  return (
    <ArgonBox sx={{ transition: "opacity 200ms linear" }}>
      <ArgonBox position="relative" textAlign="center">
        <ArgonBox textAlign="center" lineHeight={0}>
          <img src={infomerics_logo} style={{height: '45px', marginBottom: '10px'}} /> <br />
          <ArgonTypography color="inherit" variant="caption"
          >
            <span style={{marginRight:"7px"}}>&copy; 2023. All rights reserved</span> 
             <span 
             style={{
              opacity:".6",
              fontSize:"10px"
             }}
             >
              {BUILD_VERSION}
            </span>
          </ArgonTypography>
        </ArgonBox>
      </ArgonBox>
    </ArgonBox>
  );
}

export default SidenavFooter;
