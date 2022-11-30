import * as Types from './types.generated';

import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { api } from './baseApi';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Types.Maybe<TTypes> | Promise<Types.Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Types.Scalars['Boolean']>;
  Card: ResolverTypeWrapper<Types.Card>;
  CardsDTO: Types.CardsDto;
  Complains: ResolverTypeWrapper<Types.Complains>;
  ComplainsDTO: ResolverTypeWrapper<Types.ComplainsDto>;
  ComplainsInputDTO: Types.ComplainsInputDto;
  CreateUserInput: Types.CreateUserInput;
  CreateUserSubscriptionArrayDTO: Types.CreateUserSubscriptionArrayDto;
  CreateUserSubscriptionDTO: Types.CreateUserSubscriptionDto;
  CreatorDTO: ResolverTypeWrapper<Types.CreatorDto>;
  Currency: Types.Currency;
  Date: ResolverTypeWrapper<Types.Scalars['Date']>;
  Email: ResolverTypeWrapper<Types.Scalars['Email']>;
  ExtraField: ResolverTypeWrapper<Types.Scalars['ExtraField']>;
  FindSubscriptions: ResolverTypeWrapper<Types.FindSubscriptions>;
  FindTemplates: ResolverTypeWrapper<Types.FindTemplates>;
  Float: ResolverTypeWrapper<Types.Scalars['Float']>;
  ID: ResolverTypeWrapper<Types.Scalars['ID']>;
  Int: ResolverTypeWrapper<Types.Scalars['Int']>;
  LoginDTO: Types.LoginDto;
  Mutation: ResolverTypeWrapper<{}>;
  PaginationArgs: Types.PaginationArgs;
  Query: ResolverTypeWrapper<{}>;
  Spending: ResolverTypeWrapper<Types.Spending>;
  String: ResolverTypeWrapper<Types.Scalars['String']>;
  TemplateDTO: ResolverTypeWrapper<Types.TemplateDto>;
  Templates: ResolverTypeWrapper<Types.Templates>;
  UpdateUserSubscriptionDTO: Types.UpdateUserSubscriptionDto;
  UserCards: ResolverTypeWrapper<Types.UserCards>;
  UserDTO: ResolverTypeWrapper<Types.UserDto>;
  UserSettingsDTO: ResolverTypeWrapper<Types.UserSettingsDto>;
  UserSubscriptionsDTO: ResolverTypeWrapper<Types.UserSubscriptionsDto>;
  UserUpdateSettingsDto: Types.UserUpdateSettingsDto;
  UsersSubscriptions: ResolverTypeWrapper<Types.UsersSubscriptions>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Types.Scalars['Boolean'];
  Card: Types.Card;
  CardsDTO: Types.CardsDto;
  Complains: Types.Complains;
  ComplainsDTO: Types.ComplainsDto;
  ComplainsInputDTO: Types.ComplainsInputDto;
  CreateUserInput: Types.CreateUserInput;
  CreateUserSubscriptionArrayDTO: Types.CreateUserSubscriptionArrayDto;
  CreateUserSubscriptionDTO: Types.CreateUserSubscriptionDto;
  CreatorDTO: Types.CreatorDto;
  Date: Types.Scalars['Date'];
  Email: Types.Scalars['Email'];
  ExtraField: Types.Scalars['ExtraField'];
  FindSubscriptions: Types.FindSubscriptions;
  FindTemplates: Types.FindTemplates;
  Float: Types.Scalars['Float'];
  ID: Types.Scalars['ID'];
  Int: Types.Scalars['Int'];
  LoginDTO: Types.LoginDto;
  Mutation: {};
  PaginationArgs: Types.PaginationArgs;
  Query: {};
  Spending: Types.Spending;
  String: Types.Scalars['String'];
  TemplateDTO: Types.TemplateDto;
  Templates: Types.Templates;
  UpdateUserSubscriptionDTO: Types.UpdateUserSubscriptionDto;
  UserCards: Types.UserCards;
  UserDTO: Types.UserDto;
  UserSettingsDTO: Types.UserSettingsDto;
  UserSubscriptionsDTO: Types.UserSubscriptionsDto;
  UserUpdateSettingsDto: Types.UserUpdateSettingsDto;
  UsersSubscriptions: Types.UsersSubscriptions;
};

export type CardResolvers<ContextType = any, ParentType extends ResolversParentTypes['Card'] = ResolversParentTypes['Card']> = {
  card?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ComplainsResolvers<ContextType = any, ParentType extends ResolversParentTypes['Complains'] = ResolversParentTypes['Complains']> = {
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  direction?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  on?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  stop?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ComplainsDtoResolvers<ContextType = any, ParentType extends ResolversParentTypes['ComplainsDTO'] = ResolversParentTypes['ComplainsDTO']> = {
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  direction?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  on?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  stop?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreatorDtoResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreatorDTO'] = ResolversParentTypes['CreatorDTO']> = {
  avatar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface EmailScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Email'], any> {
  name: 'Email';
}

export interface ExtraFieldScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ExtraField'], any> {
  name: 'ExtraField';
}

export type FindSubscriptionsResolvers<ContextType = any, ParentType extends ResolversParentTypes['FindSubscriptions'] = ResolversParentTypes['FindSubscriptions']> = {
  limit?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  list?: Resolver<Array<ResolversTypes['UserSubscriptionsDTO']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FindTemplatesResolvers<ContextType = any, ParentType extends ResolversParentTypes['FindTemplates'] = ResolversParentTypes['FindTemplates']> = {
  limit?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  list?: Resolver<Array<ResolversTypes['TemplateDTO']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createCards?: Resolver<Array<ResolversTypes['UserCards']>, ParentType, ContextType, RequireFields<Types.MutationCreateCardsArgs, 'data'>>;
  createComplain?: Resolver<ResolversTypes['Complains'], ParentType, ContextType, RequireFields<Types.MutationCreateComplainArgs, 'data'>>;
  createSubscription?: Resolver<ResolversTypes['UsersSubscriptions'], ParentType, ContextType, RequireFields<Types.MutationCreateSubscriptionArgs, 'data'>>;
  createSubscriptionsFromLocalStorage?: Resolver<Array<ResolversTypes['UsersSubscriptions']>, ParentType, ContextType, RequireFields<Types.MutationCreateSubscriptionsFromLocalStorageArgs, 'data'>>;
  createTemplate?: Resolver<ResolversTypes['Templates'], ParentType, ContextType, RequireFields<Types.MutationCreateTemplateArgs, 'id' | 'subscriptionId'>>;
  delete?: Resolver<ResolversTypes['UserCards'], ParentType, ContextType, RequireFields<Types.MutationDeleteArgs, 'id'>>;
  deleteSubscription?: Resolver<ResolversTypes['UsersSubscriptions'], ParentType, ContextType, RequireFields<Types.MutationDeleteSubscriptionArgs, 'id'>>;
  login?: Resolver<ResolversTypes['UserDTO'], ParentType, ContextType, RequireFields<Types.MutationLoginArgs, 'mutationArgs'>>;
  register?: Resolver<ResolversTypes['UserDTO'], ParentType, ContextType, RequireFields<Types.MutationRegisterArgs, 'userModel'>>;
  removeTemplate?: Resolver<ResolversTypes['Templates'], ParentType, ContextType, RequireFields<Types.MutationRemoveTemplateArgs, 'templateId'>>;
  updateCard?: Resolver<ResolversTypes['UserCards'], ParentType, ContextType, RequireFields<Types.MutationUpdateCardArgs, 'id' | 'newCard'>>;
  updateSubscription?: Resolver<ResolversTypes['UsersSubscriptions'], ParentType, ContextType, RequireFields<Types.MutationUpdateSubscriptionArgs, 'data' | 'id'>>;
  updateUserSettings?: Resolver<ResolversTypes['UserSettingsDTO'], ParentType, ContextType, RequireFields<Types.MutationUpdateUserSettingsArgs, 'update'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  findComplains?: Resolver<Array<ResolversTypes['ComplainsDTO']>, ParentType, ContextType>;
  findSubscriptionBy?: Resolver<ResolversTypes['UserSubscriptionsDTO'], ParentType, ContextType, Partial<Types.QueryFindSubscriptionByArgs>>;
  findSubscriptions?: Resolver<ResolversTypes['FindSubscriptions'], ParentType, ContextType, RequireFields<Types.QueryFindSubscriptionsArgs, 'pagination'>>;
  findTemplates?: Resolver<ResolversTypes['FindTemplates'], ParentType, ContextType, RequireFields<Types.QueryFindTemplatesArgs, 'pagination'>>;
  findTemplatesBy?: Resolver<ResolversTypes['Templates'], ParentType, ContextType, Partial<Types.QueryFindTemplatesByArgs>>;
  notificate?: Resolver<ResolversTypes['UserSubscriptionsDTO'], ParentType, ContextType>;
  spendings?: Resolver<Array<ResolversTypes['Spending']>, ParentType, ContextType>;
  userSettings?: Resolver<ResolversTypes['UserSettingsDTO'], ParentType, ContextType>;
};

export type SpendingResolvers<ContextType = any, ParentType extends ResolversParentTypes['Spending'] = ResolversParentTypes['Spending']> = {
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  left?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateDtoResolvers<ContextType = any, ParentType extends ResolversParentTypes['TemplateDTO'] = ResolversParentTypes['TemplateDTO']> = {
  creator?: Resolver<ResolversTypes['CreatorDTO'], ParentType, ContextType>;
  creator_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  logo_url?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  second_title?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  usage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  visible?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplatesResolvers<ContextType = any, ParentType extends ResolversParentTypes['Templates'] = ResolversParentTypes['Templates']> = {
  creator_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  logo_url?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  second_title?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  visible?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserCardsResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserCards'] = ResolversParentTypes['UserCards']> = {
  card?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserDtoResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserDTO'] = ResolversParentTypes['UserDTO']> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  avatar_url?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cards?: Resolver<Types.Maybe<Array<ResolversTypes['Card']>>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['Email'], ParentType, ContextType>;
  grant?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  language?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  theme?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSettingsDtoResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserSettingsDTO'] = ResolversParentTypes['UserSettingsDTO']> = {
  cards?: Resolver<Types.Maybe<Array<ResolversTypes['Card']>>, ParentType, ContextType>;
  language?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  theme?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  user_id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSubscriptionsDtoResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserSubscriptionsDTO'] = ResolversParentTypes['UserSubscriptionsDTO']> = {
  card?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  card_id?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  created?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  creator_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  extra_fields?: Resolver<Types.Maybe<ResolversTypes['ExtraField']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  logo_url?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notification_period?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notification_type?: Resolver<Types.Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  pay_day?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  second_title?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  template?: Resolver<ResolversTypes['TemplateDTO'], ParentType, ContextType>;
  template_id?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  usage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UsersSubscriptionsResolvers<ContextType = any, ParentType extends ResolversParentTypes['UsersSubscriptions'] = ResolversParentTypes['UsersSubscriptions']> = {
  card_id?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  creator_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['Currency'], ParentType, ContextType>;
  extra_fields?: Resolver<ResolversTypes['ExtraField'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  logo_url?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notification_period?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notification_type?: Resolver<Types.Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  pay_day?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  second_title?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  template_id?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  visible?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Card?: CardResolvers<ContextType>;
  Complains?: ComplainsResolvers<ContextType>;
  ComplainsDTO?: ComplainsDtoResolvers<ContextType>;
  CreatorDTO?: CreatorDtoResolvers<ContextType>;
  Date?: GraphQLScalarType;
  Email?: GraphQLScalarType;
  ExtraField?: GraphQLScalarType;
  FindSubscriptions?: FindSubscriptionsResolvers<ContextType>;
  FindTemplates?: FindTemplatesResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Spending?: SpendingResolvers<ContextType>;
  TemplateDTO?: TemplateDtoResolvers<ContextType>;
  Templates?: TemplatesResolvers<ContextType>;
  UserCards?: UserCardsResolvers<ContextType>;
  UserDTO?: UserDtoResolvers<ContextType>;
  UserSettingsDTO?: UserSettingsDtoResolvers<ContextType>;
  UserSubscriptionsDTO?: UserSubscriptionsDtoResolvers<ContextType>;
  UsersSubscriptions?: UsersSubscriptionsResolvers<ContextType>;
};



export const ComplainDocument = `
    mutation Complain($data: ComplainsInputDTO!) {
  createComplain(data: $data) {
    id
  }
}
    `;

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    Complain: build.mutation<ComplainMutation, ComplainMutationVariables>({
      query: (variables) => ({ document: ComplainDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };
export const { useComplainMutation } = injectedRtkApi;


export type ComplainMutationVariables = Types.Exact<{
  data: Types.ComplainsInputDto;
}>;


export type ComplainMutation = { __typename?: 'Mutation', createComplain: { __typename?: 'Complains', id: string } };
