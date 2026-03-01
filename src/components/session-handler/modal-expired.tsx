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
    sessionTimeout: number
}

export const ExpiredModal: React.FC<ExpiredModalProps> = ({
    dismissModal,
    sessionTimeout,
}) => {
    const { baseUrl } = useConfig()

    const sessionTimeoutInMinutes = Math.floor(sessionTimeout / 60)

    const goToLogin = () => {
        window.open(baseUrl)
    }
    const dismiss = () => {
        dismissModal()
    }
    return (
        <Modal>
            <ModalTitle>{i18n.t('You have been logged out')}</ModalTitle>
            <ModalContent>
                {i18n.t(
                    'Your session ended after {{sessionTimeoutInMinutes}} minutes without network activity. Log in again to continue.',
                    { sessionTimeoutInMinutes }
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={dismiss}>{i18n.t('Dismiss')}</Button>

                    <Button primary onClick={goToLogin}>
                        {i18n.t('Log in')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
