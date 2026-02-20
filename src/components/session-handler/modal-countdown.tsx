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

type ExpirationCountdownModalProps = {
    countDown: number
    loading: boolean
    onExtendSession: () => void
}

export const ExpirationCountdownModal: React.FC<
    ExpirationCountdownModalProps
> = ({ countDown, onExtendSession, loading }) => {
    return (
        <Modal>
            <ModalTitle>{i18n.t('Your session is about to expire')}</ModalTitle>
            {/* ToDO: maybe makes sense to format the countDown in minutes / seconds? */}
            <ModalContent>
                {i18n.t('Your session will expire in {{countDown}} seconds.', {
                    countDown,
                })}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    {/* can this get into undesired state when offline - i.e. can't extend but want to dismiss */}
                    <Button primary onClick={onExtendSession} loading={loading}>
                        {i18n.t('Extend session')}
                    </Button>
                    {/* <Button>Dismiss</Button> */}
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
