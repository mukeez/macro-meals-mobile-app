export interface AccordionItem {
  title: string;
  content: string[];
  links?: { label: string; url: string }[];
}

export const healthGuidelinesData: AccordionItem[] = [
  {
    title: "Energy Equations (3)",
    content: [
      "Our macro calculations are based on scientifically validated energy equations that have been extensively researched and peer-reviewed."
    ],
    links: [
      {
        label: "Mifflin-St Jeor (1990)",
        url: "https://pubmed.ncbi.nlm.nih.gov/2305711/"
      },
      {
        label: "Harris-Benedict (1919)",
        url: "https://pubmed.ncbi.nlm.nih.gov/2520314/"
      }
    ]
  },
  {
    title: "Macronutrient Distribution",
    content: [
      "Protein, carbohydrate, and fat recommendations are based on current dietary guidelines and research on optimal performance and health outcomes."
    ],
    links: [
      {
        label: "Dietary Guidelines for Americans",
        url: "https://www.dietaryguidelines.gov/"
      },
      {
        label: "Position of the Academy of Nutrition and Dietetics",
        url: "https://www.jandonline.org/article/S2212-2672(16)31192-3/fulltext"
      }
    ]
  },
  {
    title: "Activity Level Multipliers",
    content: [
      "Physical activity multipliers are derived from comprehensive studies on energy expenditure across different activity levels and lifestyles."
    ],
    links: [
      {
        label: "Physical Activity Guidelines for Americans",
        url: "https://health.gov/our-work/national-health-initiatives/physical-activity-initiative"
      },
      {
        label: "WHO Physical Activity Guidelines",
        url: "https://www.who.int/publications/i/item/9789241599979"
      }
    ]
  }
]; 