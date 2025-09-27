import React, { useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

import Typography from '@mui/material/Typography';
import Paper from "@mui/material/Paper";
import Backdrop from '@mui/material/Backdrop';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import Divider from '@mui/material/Divider';

import "../../css/NewUser.css";

/**
 * Renders upon successful registration. 
 * Redirects to the home page after delay.
 * 
 * @author syuki
 */
const RegistrationSuccess = ({isAuthenticated}) => {

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if(isAuthenticated){
        navigate('/');
        }
    }, []);

    //Sends out registration status to the redirected home page.  
    useEffect(() => {
        setTimeout(() => {
        navigate('/', {
            state: {
                auth: true,
                userType: location.state.userType
            }
          })
        }, 5000)
    }, []);

    return (
        <div className="new-user-body">
            <Backdrop open className="backdrop-design">
                <Paper elevation={0} className="new-user-paper">
                    <center>
                        <Typography style={{ paddingTop: 30, fontWeight: "500" }} component="h1" variant="h5">Successfully Registered!</Typography>
                        <CheckCircleOutlineOutlinedIcon style = {{ paddingTop: 40, fontSize: 200, color: "#2D323F"}} 
                            aria-label="success tick" />
                        <p style={{ paddingBottom: "0" }}>Redirecting to home page.</p>
                        <p style={{ fontSize: 12, paddingTop: 0 }}>Please <Link className="ModalLink" href="/">click here</Link> if you're not redirected automatically.</p>
                        <Divider style={{ marginBottom: 20 }} />
                    </center>
                </Paper>
            </Backdrop>
        </div>
    );
 };

 export default RegistrationSuccess;