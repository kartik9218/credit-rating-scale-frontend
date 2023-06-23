import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { SET_PAGE_TITLE, SET_DATA } from "helpers/Base";
import { Backdrop, CircularProgress } from "@mui/material";
import { IllustrationLayout } from "layouts";
import {
  ArgonBox,
  ArgonButton,
  ArgonInput,
  ArgonTypography,
  ArgonSnackbar,
} from "components/ArgonTheme";
import { GET_QUERY } from "helpers/Base";

function Login() {
  const navigate = useNavigate();
  const token = GET_QUERY("token");
  const { REACT_APP_BUILD_VERSION: BUILD_VERSION } = process.env;
  const [loginUrl, setLoginUrl] = useState(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showCheckUser, setShowCheckUser] = useState(false);
  const [UUID, setUUID] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(``);
  const DEFAULT_SNACKBAR_MESSAGE = "Please check your email, password and retry.";
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(DEFAULT_SNACKBAR_MESSAGE);
  const [backdropOpen, setBackdropOpen] = useState(false);
  
  useEffect(() => {
    SET_PAGE_TITLE("Login");
    if (token) {
      SET_PAGE_TITLE("Validating token");
      setBackdropOpen(true);
      processAzureToken(token);
    }
  }, []);

  useEffect(() => {
    if (loginUrl) {
      loginWithAzure();
    }
  }, [loginUrl]);

  const onCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const checkUser = async (ev) => {
    
    ev.preventDefault();
    HTTP_CLIENT(APIFY("/auth/check_user_code"), {
      user_code: email,
    })
      .then((data) => {
        setBackdropOpen(true);
        setUUID(data.user.uuid);
        setShowCheckUser(true);

        setTimeout(() => {
          setBackdropOpen(false);

          if (data.login_url) {
            setLoginUrl(data.login_url);
            return;
          }

          setShowPassword(true);
        }, 1000);
      })
      .catch((err) => {
        setSnackbarMessage(`Please check, no account found with given email address.`);
        setSnackbarOpen(true);
      });
  };

  const onFormSubmit = async (ev) => {
    ev.preventDefault();
    if(!UUID) return;
    HTTP_CLIENT(APIFY("/auth/login"), {
      uuid: UUID,
      password: password,
    })
      .then((data) => {
        processAjaxResponse(data);
      })
      .catch((err) => {
        setSnackbarMessage(DEFAULT_SNACKBAR_MESSAGE);
        setSnackbarOpen(true);
      });
  };



  const loginWithAzure = () => {
    setBackdropOpen(true);
    document.location.href = loginUrl;
  };


  const processAzureToken = (token) => {
    HTTP_CLIENT(APIFY("/auth/login_azure_token"), {
      token: token,
    })
      .then((data) => {
        processAjaxResponse(data);
      })
      .catch((err) => {
        setSnackbarMessage(DEFAULT_SNACKBAR_MESSAGE);
        setSnackbarOpen(true);
      });
  };

  const processAjaxResponse = (data) => {
    var activeRole = data["user"]["roles"][0];
    if (!activeRole) {
      setSnackbarMessage(`No roles assigned to this user. Unable to process.`);
      setSnackbarOpen(true);
      return;
    }

    SET_DATA("user", data["user"]);
    SET_DATA("active_role", data["user"]["roles"][0]);

    setBackdropOpen(true);
    setTimeout(() => {
      setBackdropOpen(false);
      navigate("/redirect");
    }, 1000);
  };

  return (
    <IllustrationLayout
      header={
        <div>
          <ArgonTypography
            color="white"
            variant="subtitle2"
            textTransform="uppercase"
            letterSpacing="1px"
            marginTop="60px"
            fontSize={{ xs: "50px", lg: "18px" }}
            textAlign={{ xs: "center", lg: "start" }}
          >
            Welcome to
          </ArgonTypography>
          <ArgonTypography
            color="white"
            variant="h4"
            fontWeight="bold"
            fontSize={{ xs: "30px", lg: "30px" }}
            textAlign={{ xs: "center", lg: "start" }}
          >
            4i Concept System
          </ArgonTypography>
        </div>
      }
      illustration={{
        title: ``,
        description: ``,
      }}
    >
      <div className="login-box">
        <ArgonBox component="form" role="form" onSubmit={showCheckUser ? onFormSubmit : checkUser}>
          <ArgonBox mb={2} width={{ xs: "340px", lg: "auto" }}>
            <ArgonInput
              id="cy-input-email"
              type="email"
              placeholder="Provide Your Email Address"
              size="large"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              required
              autoFocus={true}
              disabled={showPassword}
            />
          </ArgonBox>

          {showPassword && (
            <ArgonBox mb={2}>
              <ArgonInput
                id="cy-input-password"
                type="password"
                placeholder="Provide Password"
                size="large"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                required
                autoFocus={true}
              />
            </ArgonBox>
          )}

          {!showCheckUser && (
            <React.Fragment>
              <ArgonBox mt={4} mb={1}>
                <ArgonButton
                  id="cy-check-user-btn"
                  color="primary"
                  size="large"
                  fullWidth
                  type="submit"
                  // onClick={checkUser}
                >
                  Log In
                </ArgonButton>
              </ArgonBox>
            </React.Fragment>
          )}

          {showCheckUser && (
            <React.Fragment>
              <ArgonBox mt={2}>
                <ArgonButton color="primary" size="large" fullWidth type="submit">
                  Log In
                </ArgonButton>
              </ArgonBox>

              <ArgonBox mt={2}>
                <ArgonButton
                  color="dark"
                  size="large"
                  fullWidth
                  onClick={(ev) => {
                    document.location.reload();
                  }}
                >
                  Reset User ID
                </ArgonButton>
              </ArgonBox>
            </React.Fragment>
          )}

          <ArgonBox
            mt={5}
            display={"flex"}
            color="#ffff"
            gap={"9px"}
            justifyContent="center"
            flexDirection="column"
          >
            <ArgonTypography color="inherit" fontSize={14} variant="caption">
              Copyright 2023. Infomerics Ratings
            </ArgonTypography>
            <ArgonTypography color="inherit" fontSize={10} opacity={".4"} variant="caption">
              Build Version: {BUILD_VERSION}
            </ArgonTypography>
          </ArgonBox>
        </ArgonBox>
      </div>
      <ArgonSnackbar
        color="error"
        icon="notifications"
        title="Something went wrong!"
        content={snackbarMessage}
        translate="yes"
        dateTime=""
        open={snackbarOpen}
        close={onCloseSnackbar}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      />

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backdropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </IllustrationLayout>
  );
}

export default Login;
