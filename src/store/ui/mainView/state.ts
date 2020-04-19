export type ViewType = 'messages' | 'qall'
export interface ViewInformationBase {
  type: ViewType
}
export type ViewInformation = MessagesView | QallView

export type LayoutType = 'single' | 'split' | 'split-reverse'

export interface MessagesView extends ViewInformationBase {
  type: 'messages'
}

export interface QallView extends ViewInformationBase {
  type: 'qall'
}

export enum MainViewComponentState {
  Hidden = 'hidden',
  SidebarAppearing = 'sidebar-appearing',
  SidebarAppearingAuto = 'sidebar-appearing-auto',
  SidebarDisappearing = 'sidebar-disappearing',
  SidebarDisappearingAuto = 'sidebar-disappearing-auto',
  SidebarShown = 'sidebar-shown',
  NavAppearing = 'nav-appearing',
  NavAppearingAuto = 'nav-appearing-auto',
  NavDisappearing = 'nav-disappearing',
  NavDisappearingAuto = 'nav-disappearing-auto',
  NavShown = 'nav-shown'
}

export interface S {
  layout: LayoutType
  isSidebarOpen: boolean
  currentMainViewComponentState: MainViewComponentState
  primaryView: ViewInformation
  secondaryView?: ViewInformation
}

export const state: S = {
  layout: 'single',
  isSidebarOpen: false,
  currentMainViewComponentState: MainViewComponentState.Hidden,
  primaryView: {
    type: 'messages'
  },
  secondaryView: {
    type: 'qall'
  }
}
