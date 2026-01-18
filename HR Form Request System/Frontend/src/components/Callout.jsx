import { useState } from "react";
import styles from "./callout.module.scss";

import { Accordion } from "react-bootstrap";

// Third Party Components
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

// TODO Fix moving div when expand
// TODO REMOVE


export default function Callout({ children, title }) {

    const [showContent, setShowContent] = useState(false);

    const toggleContent = () => {
        setShowContent(!showContent);
    }

    return (
        <div className={styles['c-callout']}>
            <button className={styles['c-callout__header']} onClick={toggleContent}>
                <div className={styles['c-callout__heading']}>
                    <span>{title}</span>
                    <FontAwesomeIcon icon={faChevronRight}
                        className={
                            showContent ? styles['c-callout__toggle--reveal'] :
                            styles['c-callout__toggle']
                        }/>
                </div>
            </button>
            <article className={
                showContent ? styles['c-callout__content--reveal'] : styles['c-callout__content']
                }>
                {children}
            </article>
        </div>
    );
}
