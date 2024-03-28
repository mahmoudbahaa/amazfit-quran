/* global AppService */

import { BasePage } from '../libs/zml/dist/zml-page'
import { playerHelper } from './playerHelper'

AppService(BasePage(playerHelper()))
