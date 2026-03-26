export interface Contentful<Field> {
	fields: Field
}

export type IContentfulResponse<T> = Contentful<T>
