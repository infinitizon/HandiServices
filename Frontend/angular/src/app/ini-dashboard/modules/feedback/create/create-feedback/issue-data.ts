export const issueData: IssueDTO[] = [
  {
    name: 'Service Quality',
    value: 'Service Quality'
  },
  {
    name: 'Vendor Issue',
    value: 'Vendor Issue'
  },
  {
    name: 'Payment Issues',
    value: 'Payment Issues'
  },
  {
    name: 'Others',
    value: 'Others'
  }
]





export interface IssueDTO {
  name: string;
  value: string;
}
