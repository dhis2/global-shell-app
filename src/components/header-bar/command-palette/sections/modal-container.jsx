import { colors, elevations } from '@dhis2/ui-constants'
import PropTypes from 'prop-types'
import React, { forwardRef, useEffect } from 'react'

const ModalContainer = forwardRef(function ModalContainer(
    { children, onKeyDown, onClick },
    ref
) {
    useEffect(() => {
        if (!ref.current) {
            return
        }
        const modal = ref.current

        const handleFocus = (event) => {
            if (event.target === modal) {
                modal?.querySelector('input').focus()
            }
        }

        modal.addEventListener('click', onClick)
        modal.addEventListener('focus', handleFocus)
        modal.addEventListener('keydown', onKeyDown)

        return () => {
            modal.removeEventListener('click', onClick)
            modal.removeEventListener('focus', handleFocus)
            modal.removeEventListener('keydown', onKeyDown)
        }
    }, [onKeyDown, ref, onClick])

    return (
        <>
            <dialog ref={ref}>{children}</dialog>
            <style jsx>{`
                dialog {
                    position: fixed;
                    margin: 0;
                    top: 40px;
                    inset-inline-end: 40px;
                    inset-inline-start: auto;
                    display: flex;
                    flex-direction: row;
                    border: none;
                    border-radius: 1px;
                    padding: 1px;
                    width: 572px;
                    max-height: 560px;
                    border-radius: 3px;
                    background: ${colors.white};
                    box-shadow: ${elevations.e400};
                }
                dialog::backdrop {
                    background-color: transparent;
                }
            `}</style>
        </>
    )
})

ModalContainer.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func,
}

export default ModalContainer
