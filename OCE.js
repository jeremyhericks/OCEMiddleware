const documents = [
  {
    id: "ROE9273492001",
    title: "News Article",
    language: "en-US",
    taxonomies: [
      {
        id: "us",
        label: "United States"
      },
      {
        id: "de",
        label: "Germany"
      }
    ]
  }
];

type Document {
  id: String
  title: String
  language: String
  taxonomies: [Taxonomy]
  translations: [Document]
  parent: Document
}
