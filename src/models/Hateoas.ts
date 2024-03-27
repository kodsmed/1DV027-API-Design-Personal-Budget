export class HateoasLink {
  rel: string
  href: string
  method: string

  /**
   * Creates an instance of the HateoasLink class.
   *
   * @param {string} rel - The relationship of the link.
   * @param {string} href - The URL of the link.
   * @param {string} method - The HTTP method of the link.
   */
  constructor(
    rel: string,
    href: string,
    method: string
  ) {
    this.rel = rel
    this.href = href
    this.method = method
  }

  /**
   * Returns the HATEOAS link as an object.
   */
  getLink() {
    return {
      rel: this.rel,
      href: this.href,
      method: this.method
    }
  }
}

export class Hateoas {
  links: HateoasLink[]
  /**
   * Creates an instance of the Hateoas class.
   *
   * @param {HateoasLink[]} links - The HATEOAS links. - optional - default is an empty array.
   */
  constructor(links?: HateoasLink[]) {
    this.links = links || []
  }

  addLink(rel: string, href: string, method: string) {
    this.links.push(new HateoasLink(rel, href, method))
  }

  getLinks() {
    return this.links.map(link => link.getLink()) // Return the links as an array of objects
  }

  toObject() {
    return {
      Links: this.getLinks()
    }
  }
}