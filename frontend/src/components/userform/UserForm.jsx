import { useState } from 'react';
import './UserForm.css';
import PropTypes from "prop-types"; //necessary for vscode

<script src="https://unpkg.com/prop-types@15.7.2/prop-types.js"></script>

function UserForm({onButtonClickEvent}) {
    const [linkInputCount, setLinkInputCount] = useState(1) //potrzebne w ogóle?
    //collect the links from all inputs
    //validate them

    //validation:
    //-proper kindle e-mail
    //-at least one proper ao3 link
    //without it the button is not active.
    //button disabled after clicking and processing, until it returns a success message.
    return (
        <form action="">
            <div className='form-content-container'>
                <p>Your <b>Kindle</b> e-mail:</p>
                <input type="text" placeholder='john_smith_pSbNDS@kindle.com' />
                <p>Links to <b>AO3 fics</b>:</p>
                <input type="text" placeholder='https://archiveofourown.org/works/61755115/chapters/157874314' />
                <div className='add-input-button-container'>
                    <button className='add-input-button'>+</button>
                </div>
                <button className='main-button' onClick={onButtonClickEvent}>
                    Test request
                </button>
            </div>
        </form>
    )
 }


UserForm.propTypes = {
onButtonClickEvent: PropTypes.func.isRequired,
};

export default UserForm;