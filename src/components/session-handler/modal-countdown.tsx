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

export const ExpirationCountdownModal = ({ countDown }) => {
    return (
        <Modal>
            <ModalTitle>{i18n.t('Your session is about to expire')}</ModalTitle>
            <ModalContent>
                Your session will expire in {countDown} seconds.
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    {/* can this get into undesired state when offline - i.e. can't extend but want to dismiss */}
                    <Button primary>Extend session</Button>
                    {/* <Button>Dismiss</Button> */}
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
