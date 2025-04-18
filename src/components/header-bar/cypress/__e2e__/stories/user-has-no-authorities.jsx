import React from 'react'
import { HeaderBar } from '../../index.js'
import {
    dataProviderData,
    createDecoratorCustomDataProviderHeaderBar,
    createDecoratorProvider,
} from './common.jsx'

export const UserHasNoAuthorities = () => <HeaderBar appName="Example!" />

UserHasNoAuthorities.decorators = [
    createDecoratorCustomDataProviderHeaderBar({
        ...dataProviderData,
        me: {
            ...dataProviderData.me,
            authorities: [],
        },
    }),
    createDecoratorProvider(),
]
