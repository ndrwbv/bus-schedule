export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  Email: any;
  ExtraField: any;
};

export type Card = {
  __typename?: 'Card';
  card: Scalars['String'];
  id: Scalars['Int'];
};

export type CardsDto = {
  cards: Array<Scalars['String']>;
};

/** Contains Complains */
export type Complains = {
  __typename?: 'Complains';
  date: Scalars['String'];
  direction: Scalars['String'];
  id: Scalars['ID'];
  on: Scalars['Float'];
  stop: Scalars['String'];
  type: Scalars['String'];
};

export type ComplainsDto = {
  __typename?: 'ComplainsDTO';
  date: Scalars['String'];
  direction: Scalars['String'];
  id: Scalars['Float'];
  on: Scalars['Float'];
  stop: Scalars['String'];
  type: Scalars['String'];
};

export type ComplainsInputDto = {
  date: Scalars['String'];
  direction: Scalars['String'];
  on: Scalars['Float'];
  stop: Scalars['String'];
  type: Scalars['String'];
};

export type CreateUserInput = {
  avatar_url?: InputMaybe<Scalars['String']>;
  email: Scalars['Email'];
  language?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  password: Scalars['String'];
  theme?: InputMaybe<Scalars['String']>;
};

export type CreateUserSubscriptionArrayDto = {
  subs: Array<CreateUserSubscriptionDto>;
};

export type CreateUserSubscriptionDto = {
  card_id?: InputMaybe<Scalars['Float']>;
  currency: Currency;
  extra_fields?: InputMaybe<Scalars['ExtraField']>;
  logo_url?: InputMaybe<Scalars['String']>;
  notification_period?: InputMaybe<Scalars['String']>;
  notification_type?: InputMaybe<Array<Scalars['String']>>;
  pay_day?: InputMaybe<Scalars['Float']>;
  price: Scalars['Float'];
  second_title?: InputMaybe<Scalars['String']>;
  template_id?: InputMaybe<Scalars['Float']>;
  title: Scalars['String'];
};

export type CreatorDto = {
  __typename?: 'CreatorDTO';
  avatar: Scalars['String'];
  name: Scalars['String'];
};

export enum Currency {
  Eur = 'EUR',
  Rub = 'RUB',
  Usd = 'USD'
}

export type FindSubscriptions = {
  __typename?: 'FindSubscriptions';
  limit: Scalars['Float'];
  list: Array<UserSubscriptionsDto>;
  page: Scalars['Float'];
  total: Scalars['Float'];
};

export type FindTemplates = {
  __typename?: 'FindTemplates';
  limit: Scalars['Float'];
  list: Array<TemplateDto>;
  page: Scalars['Float'];
  total: Scalars['Float'];
};

export type LoginDto = {
  email: Scalars['Email'];
  password: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createCards: Array<UserCards>;
  createComplain: Complains;
  createSubscription: UsersSubscriptions;
  createSubscriptionsFromLocalStorage: Array<UsersSubscriptions>;
  createTemplate: Templates;
  delete: UserCards;
  deleteSubscription: UsersSubscriptions;
  login: UserDto;
  register: UserDto;
  removeTemplate: Templates;
  updateCard: UserCards;
  updateSubscription: UsersSubscriptions;
  updateUserSettings: UserSettingsDto;
};


export type MutationCreateCardsArgs = {
  data: CardsDto;
};


export type MutationCreateComplainArgs = {
  data: ComplainsInputDto;
};


export type MutationCreateSubscriptionArgs = {
  data: CreateUserSubscriptionDto;
};


export type MutationCreateSubscriptionsFromLocalStorageArgs = {
  data: CreateUserSubscriptionArrayDto;
};


export type MutationCreateTemplateArgs = {
  id: Scalars['Float'];
  subscriptionId: Scalars['Float'];
};


export type MutationDeleteArgs = {
  id: Scalars['Float'];
};


export type MutationDeleteSubscriptionArgs = {
  id: Scalars['Float'];
};


export type MutationLoginArgs = {
  mutationArgs: LoginDto;
};


export type MutationRegisterArgs = {
  userModel: CreateUserInput;
};


export type MutationRemoveTemplateArgs = {
  templateId: Scalars['Float'];
};


export type MutationUpdateCardArgs = {
  id: Scalars['Float'];
  newCard: Scalars['String'];
};


export type MutationUpdateSubscriptionArgs = {
  data: UpdateUserSubscriptionDto;
  id: Scalars['Float'];
};


export type MutationUpdateUserSettingsArgs = {
  update: UserUpdateSettingsDto;
};

export type PaginationArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  page?: InputMaybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  findComplains: Array<ComplainsDto>;
  findSubscriptionBy: UserSubscriptionsDto;
  /** Returns curent user subscriptions */
  findSubscriptions: FindSubscriptions;
  findTemplates: FindTemplates;
  findTemplatesBy: Templates;
  notificate: UserSubscriptionsDto;
  spendings: Array<Spending>;
  userSettings: UserSettingsDto;
};


export type QueryFindSubscriptionByArgs = {
  id?: InputMaybe<Scalars['Float']>;
  slug?: InputMaybe<Scalars['String']>;
};


export type QueryFindSubscriptionsArgs = {
  pagination: PaginationArgs;
};


export type QueryFindTemplatesArgs = {
  pagination: PaginationArgs;
  search?: InputMaybe<Scalars['String']>;
};


export type QueryFindTemplatesByArgs = {
  id?: InputMaybe<Scalars['Float']>;
  slug?: InputMaybe<Scalars['String']>;
};

export type Spending = {
  __typename?: 'Spending';
  currency: Currency;
  left: Scalars['Float'];
  total: Scalars['Float'];
};

export type TemplateDto = {
  __typename?: 'TemplateDTO';
  creator: CreatorDto;
  creator_id: Scalars['String'];
  currency: Currency;
  id: Scalars['Float'];
  logo_url?: Maybe<Scalars['String']>;
  price: Scalars['Float'];
  second_title?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  title: Scalars['String'];
  usage: Scalars['Float'];
  visible: Scalars['Boolean'];
};

/** Contains templates */
export type Templates = {
  __typename?: 'Templates';
  creator_id: Scalars['String'];
  currency: Currency;
  id: Scalars['ID'];
  logo_url?: Maybe<Scalars['String']>;
  price: Scalars['Float'];
  second_title?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  title: Scalars['String'];
  visible: Scalars['Boolean'];
};

export type UpdateUserSubscriptionDto = {
  card_id?: InputMaybe<Scalars['Float']>;
  currency: Currency;
  extra_fields?: InputMaybe<Scalars['ExtraField']>;
  logo_url?: InputMaybe<Scalars['String']>;
  notification_period?: InputMaybe<Scalars['String']>;
  notification_type?: InputMaybe<Array<Scalars['String']>>;
  pay_day?: InputMaybe<Scalars['Float']>;
  price?: InputMaybe<Scalars['Float']>;
  second_title?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
};

export type UserCards = {
  __typename?: 'UserCards';
  card: Scalars['String'];
  id: Scalars['ID'];
  user_id: Scalars['String'];
};

export type UserDto = {
  __typename?: 'UserDTO';
  active: Scalars['Boolean'];
  avatar_url?: Maybe<Scalars['String']>;
  cards?: Maybe<Array<Card>>;
  createdAt: Scalars['Date'];
  email: Scalars['Email'];
  grant: Scalars['Float'];
  id: Scalars['Float'];
  language?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  theme?: Maybe<Scalars['String']>;
  token: Scalars['String'];
  updatedAt: Scalars['Date'];
};

export type UserSettingsDto = {
  __typename?: 'UserSettingsDTO';
  cards?: Maybe<Array<Card>>;
  language?: Maybe<Scalars['String']>;
  theme?: Maybe<Scalars['String']>;
  user_id?: Maybe<Scalars['String']>;
};

export type UserSubscriptionsDto = {
  __typename?: 'UserSubscriptionsDTO';
  card?: Maybe<Scalars['String']>;
  card_id?: Maybe<Scalars['Float']>;
  created: Scalars['Date'];
  creator_id: Scalars['String'];
  currency: Currency;
  extra_fields?: Maybe<Scalars['ExtraField']>;
  id: Scalars['Float'];
  logo_url?: Maybe<Scalars['String']>;
  notification_period?: Maybe<Scalars['String']>;
  notification_type?: Maybe<Array<Scalars['String']>>;
  pay_day?: Maybe<Scalars['Float']>;
  price: Scalars['Float'];
  second_title?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  template: TemplateDto;
  template_id?: Maybe<Scalars['Float']>;
  title: Scalars['String'];
  updated: Scalars['Date'];
  usage: Scalars['Float'];
};

export type UserUpdateSettingsDto = {
  language?: InputMaybe<Scalars['String']>;
  theme?: InputMaybe<Scalars['String']>;
};

/** Contains user data for subscriptions */
export type UsersSubscriptions = {
  __typename?: 'UsersSubscriptions';
  card_id?: Maybe<Scalars['Float']>;
  creator_id: Scalars['String'];
  currency: Currency;
  extra_fields: Scalars['ExtraField'];
  id: Scalars['ID'];
  logo_url?: Maybe<Scalars['String']>;
  notification_period?: Maybe<Scalars['String']>;
  notification_type?: Maybe<Array<Scalars['String']>>;
  pay_day?: Maybe<Scalars['Float']>;
  price: Scalars['Float'];
  second_title?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  template_id?: Maybe<Scalars['Float']>;
  title: Scalars['String'];
  visible: Scalars['Boolean'];
};
