import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import MainContainer from "../../components/MainContainer";
import styles from "./errorHandling.module.scss";
import { Accordion } from "react-bootstrap";

import error404Image from "../../assets/ErrorImages/Error404.png";
import error418Image from "../../assets/ErrorImages/Error418.jpg"

export default function ErrorBoundary() {
    let error = useRouteError();
    console.log(error);
    let errorImage = error404Image;


    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            error.message = "This page doesn't exist!";
        }

        if (error.status === 401) {
            error.message = "You aren't authorized to see this";
        }

        if (error.status === 503) {
            error.message = "Looks like our API is down";
        }

        if (error.status === 418) {
            error.message = "I'm a 🫖. Find a ☕️ pot!";
            errorImage = error418Image;
        }
    }
    else {
        error.message = "Error but not a React Router one"
    }

    const errorMessage = error.message;

    // Remove error (too verbose) and message (redundant) properties for later render
    error = Object.fromEntries( 
        Object.entries(error).filter(([key]) => !['error', 'message'].includes(key)
    ));

  return (
    <MainContainer navVisible={false}>
        <div className={styles['o-error-layout']}>
            <article className={styles['c-error']}>
                <figure className={styles['c-figure']}>
                    <img className={styles['c-figure__image']} src={errorImage}
                        alt="Funny thing to show error"></img>
                </figure>
                <h1 className={styles['c-error__heading']}>Oops! Sorry, an error has occurred.</h1>
                <p className={styles['c-error__message']}>{errorMessage} -> <Link to="/">Return Home</Link></p>
                <Accordion className={styles['c-callout']}>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>
                            Error Details
                        </Accordion.Header>
                        <Accordion.Body>
                            <ul>
                                {Object.entries(error).map(([key, value]) => {
                                 return (
                                    <li key={key}>
                                        {key}: {JSON.stringify(value)}
                                    </li>
                                )                                
                                })}
                            </ul>
                            See Console Log for more verbose details.
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </article>
        </div>
    </MainContainer>
  );
}
