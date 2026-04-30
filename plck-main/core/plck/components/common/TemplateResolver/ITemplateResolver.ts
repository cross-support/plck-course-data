
export interface ITemplateResolver {
    create(): Promise<string>
}