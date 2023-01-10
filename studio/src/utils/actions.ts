import lodash from 'lodash'

type IActions = {
  [key: string]: {
    label: string
    options: {
      [key: string]: any
    }
    next?: string[]
  }
}

export const ACTIONS: IActions = {
  create: {
    label: 'Create new data',
    options: {
      model: ({ models }) => Object.values(models).map(m => ({ key: m.name, label: m.name })),
    },
    next: ['openPage'],
  },
  login: {
    label: 'Login',
    options: {
      email: ({ components }) =>
        components.map(p => ({ key: p.id, label: `${p.type}/${p.id}` })),
      password: ({ components }) =>
        components.map(p => ({ key: p.id, label: `${p.type}/${p.id}` })),
    },
    next: ['openPage'],
  },
  openPage: {
    label: 'Open page',
    options: {
      page: ({ pages }) =>
        Object.values(pages).map(p => ({ key: p.pageId, label: p.pageName })),
      open: () => [
        { key: true, label: 'In new page' },
        { key: false, label: 'In same page' },
      ],
    },
  },
  levelUp: {
    label: 'Move item up',
    options: {},
  },
  levelDown: {
    label: 'Move item down',
    options: {},
  },
  previous: {
    label: 'Previous',
    options: {
      //data: ({components}) => components.map(p => ({key: p.id, label: p.id})),
    },
    next: ['openPage'],
  },
  next: {
    label: 'Next',
    options: {
      //data: ({components}) => components.map(p => ({key: p.id, label: p.id})),
    },
    next: ['openPage'],
  },
  delete: {
    label: 'Delete',
    options: {
      //data: ({components}) => components.map(p => ({key: p.id, label: p.id})),
    },
  },
  gotoSession: {
    label: 'Get session',
    options: {
      //data: ({components}) => components.map(p => ({key: p.id, label: p.id})),
    },
    next: ['openPage'],
  },
  addChild: {
    label: 'Add child',
    options: {
      child: ({ components }) =>
        components.map(p => ({ key: p.id, label: `${p.type}/${p.id}` })),
    },
  },
  sendMessage: {
    label: 'Send Message',
    options: {
      destinee: ({ components }) =>
        components.map(p => ({ key: p.id, label: `${p.type}/${p.id}` })),
      contents: ({ components }) =>
        components.map(p => ({ key: p.id, label: `${p.type}/${p.id}` })),
    },
  },
  createPost: {
    label: 'Create post',
    options: {
      contents: ({ components }) =>
        components.map(p => ({ key: p.id, label: `${p.type}/${p.id}` })),
      media: ({ components }) =>
        components
          .filter(c => c.type=='UploadFile')
          .map(p => ({ key: p.id, label: `${p.type}/${p.id}` })),
    },
  },
  setOrderItem: {
    label: 'Set to order',
    options: {
      quantity: ({ components }) =>
        components
          .filter(c => c.type == 'Input')
          .map(p => ({ key: p.id, label: `${p.type}/${p.id}` })),
    },
  },
  removeOrderItem: {
    label: 'Remove from order',
    options: [],
  },
  inviteGuest: {
    label: 'Invite to event',
    options: {
      email: ({ components }) =>
        components
          .filter(c => c.type == 'Input')
          .map(p => ({ key: p.id, label: `${p.type}/${p.id}` })),
      phone: ({ components }) =>
        components
          .filter(c => c.type == 'Input')
          .map(p => ({ key: p.id, label: `${p.type}/${p.id}` })),
    },
  },
  save: {
    label: 'Save/create',
    options: {
      model: ({ models }) => Object.values(models).map(m => ({ key: m.name, label: m.name })),
      ...Object.fromEntries(lodash.range(10).map((idx:number) => {
      return [
        `component_${idx}`,
        ({ components }) => components
          .filter(comp => (comp.props?.dataSource || comp.props?.model) && comp.props?.attribute)
          .map(comp => ({ key: comp.id, label: `${comp.type}/${comp.id}` }))

      ]})),
    },
    next: ['openPage'],
  },
  // Mettre un warning si les composants ne sont pas dans le même flex
  registerToEvent: {
    label: 'Register to event',
    options: {},
    next: ['openPage'],
  },
  // FUMOIR
  // Mettre un warning si les composants ne sont pas dans le même flex
  pay: {
    label: 'Pay',
    options: {
      customer: ({ components }) => components
        .filter(comp => comp.type=='Select')
        .map(comp => ({ key: comp.id, label: `${comp.type}/${comp.id}` })),
      amount: ({ components }) => components
        .filter(comp => comp.type=='Input')
        .map(comp => ({ key: comp.id, label: `${comp.type}/${comp.id}` })),
      redirect: ({ pages }) =>
        Object.values(pages).map(p => ({ key: p.pageId, label: p.pageName })),
    },
  },
  // FUMOIR
  // Mettre un warning si les composants ne sont pas dans le même flex
  previous: {
    label: 'Previous',
    options: {},
  },
  // Register new User
  register: {
    label: 'Register new account',
    options: {
      ...Object.fromEntries(lodash.range(10).map((idx:number) => {
      return [
        `component_${idx}`,
        ({ components }) => components
          .filter(comp => (comp.props?.dataSource||comp.props?.model) && comp.props?.attribute)
          .map(comp => ({ key: comp.id, label: `${comp.type}/${comp.id}` }))

      ]})),
    },
    next: ['openPage'],
  },
  logout: {
    label: 'Logout',
    options: {},
    next: ['openPage'],
  },

}

export const allowsActions = (component: IComponent) => {
  return ['Button', 'IconButton', 'Flex'].includes(component.type)
}
