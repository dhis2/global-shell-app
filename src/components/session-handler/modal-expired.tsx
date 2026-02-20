import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui'
import * as React from 'react'

type ExpiredModalProps = {
    dismissModal: () => void
}

export const ExpiredModal: React.FC<ExpiredModalProps> = ({ dismissModal }) => {
    const { baseUrl } = useConfig()

    const goToLogin = () => {
        window.open(baseUrl)
    }
    const dismiss = () => {
        dismissModal()
    }
    return (
        <Modal>
            <ModalTitle>{i18n.t('Your session has expired')}</ModalTitle>
            <ModalContent>
                {/* {i18n.t('Your session has expired.')}{' '} */}
                {/* {i18n.t(
                            'You can go to the login page or dismiss the modal if the app supports working offline.'
                        )} */}
                <br />
                Eos omnis cumque quia quaerat aut. Neque consequuntur sed non a
                quibusdam eligendi. Fugit eveniet expedita nihil ab maxime sequi
                nihil quidem. Et aut nobis assumenda in iure.
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={dismiss}>Dismiss</Button>

                    <Button primary onClick={goToLogin}>
                        {i18n.t('Go to login')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
