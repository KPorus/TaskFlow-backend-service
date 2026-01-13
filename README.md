Architecture Diagram Of Backend service
```mermaid
erDiagram
    USER {
        string _id
        string name
        string email
        string password
        datetime createdAt
        datetime updatedAt
    }

    TEAM {
        string _id
        string name
        string ownerId
        datetime createdAt
        datetime updatedAt
    }

    TEAM_MEMBER {
        string _id
        string teamId
        string userId
    }

    TASK {
        string _id
        string title
        string description
        string status "TODO | IN_PROGRESS | DONE"
        string priority "LOW | MEDIUM | HIGH"
        string assigneeId
        string creatorId
        string teamId
        datetime dueDate
        datetime createdAt
        datetime updatedAt
    }

    %% Relationships
    USER ||--o{ TEAM : "owns"
    USER ||--o{ TEAM_MEMBER : "is"
    TEAM ||--o{ TEAM_MEMBER : "has"
    TEAM ||--o{ TASK : "contains"
    USER ||--o{ TASK : "creates"
    USER ||--o{ TASK : "assigned_to"

```
