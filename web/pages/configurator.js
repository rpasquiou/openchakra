const {
  BLADE_SHAPES,
  DROITE,
  FIX_TYPES,
  PIN,
  SOLD,
} = require('../utils/feurst_consts')
import React from 'react'

import '../static/feurst.css'

const {is_development} = require('../config/config')
const axios = require('axios')
const {setAxiosAuthentication} = require('../utils/authentication')
const {Button, Grid} = require('@material-ui/core')
const {withTranslation} = require('react-i18next')
const {STEPS} = require('./configurator/configuratorSteps')
const ProgressBar = require('../components/ProgressBar/ProgressBar')
const lodash = require('lodash')
const {snackBarError, snackBarSuccess} = require('../utils/notifications')

export const feurstImgPath = './static/assets/img/feurst'


class Configurator extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 0,
      machines: [],
      type: '',
      types: ['excavatrice', 'chargeuse', 'pelle-butte'],
      mark: '',
      marks: [],
      model: '',
      models: [],
      power: null,
      powers: [],
      weight: null,
      weights: [],
      bladeThickness: null,
      bucketWidth: null,
      thicknesses: [],
      ground: null,
      grounds: [],
      teethShieldFixType: null,
      borderShieldFixType: null,
      auto_quotation: false,
    }


    if (is_development()) {
      this.state={...this.state, step: 4,
        type: 'excavatrice', mark: 'CATERPILLAR', borderShieldFixType: SOLD,
        teethShieldFixType: PIN,
        model: '374D L', weight: 75.5, power: 355,
        ground: 'GRAVIER', bladeShape: DROITE, bladeThickness: 70, phone: '0675774324',
        firstname: 'Richard', name: 'Pasquiou', company: 'COLAS', email: 'richard.pasquiou@alfredplace.io',
      }
    }
  }

  componentDidMount = () => {
    setAxiosAuthentication()
    axios
      .get('/feurst/api/database')
      .then(res => {
        this.setState({
          machines: res.data.machines,
          thicknesses: res.data.thicknesses,
          grounds: res.data.grounds,
        })
        this.onMachinesChange(res.data.machines)
      })
      .catch(err => console.error(err))

    if (is_development()) {
      this.getPrecos()
    }
  }

  getPrecos = () => {
    setAxiosAuthentication()
    const data=lodash.pick(this.state, 'type mark model power weight bladeThickness ground borderShieldFixType teethShieldFixType bladeShape'.split(' '))
    axios.get('/feurst/api/auto_quotation_available', {params: data})
      .then(res => {
        this.setState({
          auto_quotation: res.data,
        })
      })
      .catch(err => console.error(err))
  }

  getList = (data, attribute) => {
    return lodash
      .uniq(data.map(v => v[attribute]))
      .sort((a, b) => (a == null ? -1 : b == null ? 1 : a - b))
      .sort()
  }

  onMachinesChange = machines => {
    this.setState({
      machines: machines,
      // types: this.getList(machines, 'type'),
      marks: this.getList(machines, 'mark'),
      models: this.getList(machines, 'model'),
      powers: this.getList(machines, 'power'),
      weights: this.getList(machines, 'weight'),
    })
  }

  onTypeChange = type => {

    const {machines} = this.state
    const isShovel = type == 'pelle-butte'

    this.setState({
      type: type,
      mark: null,
      model: null,
      power: null,
      weight: null,
      marks:
        (isShovel && []) ||
        this.getList(
          machines.filter(v => v.type == type),
          'mark',
        ),
      models:
        (isShovel && []) ||
        this.getList(
          machines.filter(v => v.type == type),
          'model',
        ),
      powers:
        (isShovel && []) ||
        this.getList(
          machines,
          'power',
        ),
      weights:
        (isShovel && []) ||
        this.getList(
          machines,
          'weight',
        ),
    })
  }

  onMarkChange = mark => {
    const {machines} = this.state
    let typeMachine = this.getList(
      machines.filter(v => !mark || v.mark == mark),
      'type',
    )

    /* TODO : Filtrer si un type de machine est déjà sélectionné */

    const nextState = {
      mark: mark,
      model: null,
      power: null,
      weight: null,
      models: this.getList(
        typeMachine.filter(v => !mark || v.mark == mark),
        'model',
      ),
    }

    typeMachine.length == 1 && Object.assign(nextState, {type: typeMachine[0]})
    this.setState(nextState)
  }

  onModelChange = model => {
    const {machines} = this.state
    const nextState = {model}

    let brand = this.getList(
      machines.filter(v => v.model == model),
      'mark',
    )
    brand.length == 1 && Object.assign(nextState, {mark: brand[0]})

    let typeMachine = this.getList(
      machines.filter(v => v.model == model),
      'type',
    )
    typeMachine.length == 1 && Object.assign(nextState, {type: typeMachine[0]})

    let powerMachine = this.getList(
      machines.filter(v => v.model == model),
      'power',
    ) || ['']
    powerMachine.length == 1 && Object.assign(nextState, {power: powerMachine[0]})

    let machineWeight = this.getList(
      machines.filter(v => v.model == model),
      'weight',
    )
    machineWeight.length == 1 && Object.assign(nextState, {weight: machineWeight[0]})

    this.setState(nextState)
  }

  onPowerChange = power => {
    this.setState({power})
  }

  onWeightChange = weight => {
    this.setState({weight})
  }

  onBladeShapeChange = bladeShape => {
    if (!Object.keys(BLADE_SHAPES).includes(bladeShape)) {
      return console.error(`Invalid blade shape:${bladeShape}`)
    }
    this.setState({bladeShape: bladeShape})
  }

  onBucketWidthChange = width => {
    this.setState({bucketWidth: width})
  }

  onBladeThicknessChange = thickness => {
    this.setState({bladeThickness: thickness})
  }

  onGroundChange = ground => {
    this.setState({ground})
  }

  onTeethShieldFixTypeChange = teethShieldFixType => {
    if (!Object.keys(FIX_TYPES).includes(teethShieldFixType)) {
      return console.error(`Invalid border shield fix type:${teethShieldFixType}`)
    }
    this.setState({teethShieldFixType})
  }

  onBorderShieldFixTypeChange = borderShieldFixType => {
    if (!Object.keys(FIX_TYPES).includes(borderShieldFixType)) {
      return console.error(`Invalid teeth shield fix type:${borderShieldFixType}`)
    }
    this.setState({borderShieldFixType})
  }

  onFixTypeChange = fixType => {
    this.setState({fixType})
  }

  onCompanyChange = company => {
    this.setState({company})
  }

  onFirstnameChange = firstname => {
    this.setState({firstname})
  }

  onNameChange = name => {
    this.setState({name})
  }

  onEmailChange = email => {
    this.setState({email})
  }

  onPhoneChange = phone => {
    this.setState({phone})
  }

  nextPage = () => {
    const {step} = this.state
    const newStep = Math.min(step + 1, STEPS.length - 1)
    // if (newStep == 3) {
    this.getPrecos()
    // }
    this.setState({step: newStep})
  }

  previousPage = () => {
    const {step} = this.state
    const newStep = Math.max(step - 1, 0)
    this.setState({step: newStep})
  }

  sendAutoQuotation = () => {
    // TODO Envoyer le PDF ou le générer sur le serveur
    setAxiosAuthentication()

    const data=lodash.pick(this.state,
      'type,mark,model,weight,power,bladeShape,bladeThickness,teethShieldFixType,borderShieldFixType,ground,firstname,name,company,phone,email'.split(','))
    axios.post('/feurst/api/auto_quotation', data)
      .then(() => {
        snackBarSuccess('Devis envoyé')
      })
      .catch(err => {
        console.error(err)
        snackBarError(JSON.stringify(err.response.data))
      })
  }

  sendCustomQuotation = () => {
    // TODO Envoyer le PDF ou le générer sur le serveur
    setAxiosAuthentication()

    const data=lodash.pick(this.state,
      'type,mark,model,weight,power,bladeShape,bladeThickness,teethShieldFixType,borderShieldFixType,ground,firstname,name,company,phone,email'.split(','))
    axios.post('/feurst/api/custom_quotation', data)
      .then(() => {
        snackBarSuccess('Demande envoyée')
      })
      .catch(err => {
        console.error(err)
        snackBarError(JSON.stringify(err.response.data))
      })
  }

  render = () => {
    const {step} = this.state

    const {component, validator, menu} = STEPS[step]
    
    return (
      <Grid
        className="configurator relative"
      >

        <h1 className='whereami'>{menu}</h1>
        <ProgressBar value={step} max={STEPS.length} />
        <div className="rounded-container m-4 p-4">
          {component({...this.state, ...this})}
        </div>
        <div className='flex justify-between w-full nextprevZone bg-white p-4'>
          <Button className='previous' disabled={step == 0} onClick={this.previousPage}>
            Précédent
          </Button>
          {STEPS.length - 1 !== step ? <Button className='next' disabled={!validator(this.state)} onClick={this.nextPage}>Suivant
          </Button> : null}
          

          {STEPS.length - 1 === step &&
          <div className='flex gap-x-4'>
            <Button className='previous' disabled={!validator(this.state)} onClick={this.sendCustomQuotation}>Contacter un expert</Button>
            {this.state.auto_quotation && <Button className='next' disabled={!validator(this.state)} onClick={this.sendAutoQuotation}>Recevoir ma configuration</Button>}
          </div>
          }
        </div>
      </Grid>)

  }
}


module.exports = withTranslation('custom', {withRef: true})(Configurator)
