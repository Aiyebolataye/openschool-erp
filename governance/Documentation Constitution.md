# OpenSchool ERP

## Documentation Constitution

---

| Field | Value |
|-------|-------|
| **Document** | Documentation Constitution — Governing Standard |
| **Version** | 1.1 |
| **Status** | Approved |
| **Date** | July 2026 |
| **Classification** | Internal |
| **Author** | Architecture Team |
| **Owner** | Solution Architect |

---

| Aspect | Detail |
|--------|--------|
| **Purpose** | Permanent governing standard for all documentation, design, implementation, and AI-generated output |
| **Scope** | Every document, Figma design, implementation task, AI output, and code contribution |
| **Authority** | Highest governing standard for documentation practices |
| **Compliance** | Mandatory for all contributors and AI assistants |

---

## Table of Contents

1. Purpose
2. Scope
3. Documentation Philosophy
4. Source of Truth Hierarchy
5. Source Conflict Resolution
6. Human Approval Boundary
7. Design Governance
8. Implementation Governance
9. AI Success Principles
10. Prompt Execution Workflow
11. Context Loading Requirements
12. Documentation Principles
13. AI Documentation Rules
14. Writing Standards
15. Technical Standards
16. Cross-Reference Standards
17. Terminology Standards
18. Architecture Protection Rules
19. Assumption Policy
20. Review Standards
21. Quality Assurance Checklist
22. Versioning & Change Management
23. Diagram Standards
24. Traceability Requirements
25. AI Self-Review Process
26. Completion Criteria
27. Constitution Summary

---

## 1. Purpose

### 1.1 Establish Permanent Documentation Rules

This Constitution establishes the permanent rules governing how documentation is written, reviewed, maintained, and evolved throughout the OpenSchool ERP project lifecycle.

After approval, all future documentation and implementation tasks must comply with this Constitution.

### 1.2 Eliminate Documentation Problems

This Constitution eliminates:

| Problem | How It Is Eliminated |
|---------|---------------------|
| Inconsistent documentation | Writing standards and terminology standards |
| Undocumented assumptions | Assumption policy and outstanding design decisions |
| Architectural drift | Architecture protection rules and source of truth hierarchy |
| Duplicated guidance | Cross-reference standards and single source of truth |
| Conflicting terminology | Terminology standards and consistency enforcement |
| Low-quality AI output | AI documentation rules and self-review process |
| Missing traceability | Traceability requirements and cross-reference standards |

### 1.3 Core Principle

OpenCode must **derive** documentation from approved sources.

It must **never invent** business rules, architectural decisions, workflows, or implementation details that are not supported by approved documentation.

When required information is unavailable, it must identify the gap rather than make assumptions.

---

## 2. Scope

### 2.1 What This Constitution Governs

| Category | Examples |
|----------|---------|
| **Documentation** | Specifications, standards, architecture documents, guides |
| **Design artifacts** | Figma designs, UI/UX documentation, wireframes |
| **Implementation** | Code, database schemas, API endpoints, events |
| **AI-generated output** | Code, documentation, tests, configurations |
| **Code contributions** | Pull requests, commits, reviews |

### 2.2 Who Must Follow This Constitution

| Role | Responsibility |
|------|---------------|
| **Solution Architect** | Ensures architectural compliance; reviews documentation |
| **Lead Developer** | Ensures code quality; reviews implementation |
| **Software Engineer** | Follows writing standards; implements according to specifications |
| **AI Coding Assistant (OpenCode)** | Follows AI documentation rules; produces compliant output |
| **Technical Writer** | Follows writing standards; maintains documentation |
| **Reviewer** | Verifies compliance with this Constitution |

### 2.3 Document Authority

| Document | Authority Level |
|----------|----------------|
| Documentation Constitution | Highest — governs all documentation practices |
| Architecture Freeze | High — governs architectural decisions |
| Platform Standards | High — governs engineering practices |
| Engineering Specifications | Medium — governs domain implementation |
| Implementation Documentation | Lowest — documents actual implementation |

---

## 3. Documentation Philosophy

### 3.1 Core Philosophy

| Principle | Description |
|-----------|-------------|
| **Documentation-first** | Documentation is written before or alongside implementation |
| **Architecture-first** | Implementation follows approved architecture; never the reverse |
| **Single Source of Truth** | Each piece of information has one authoritative source |
| **Consistency over convenience** | Consistent documentation is more valuable than convenient shortcuts |
| **Clarity over verbosity** | Clear, concise writing is preferred over lengthy explanations |
| **Long-term maintainability** | Documentation is written to be maintained, not just created |
| **Reusability** | Documentation is structured for reuse across contexts |
| **Traceability** | Every implementation decision traces to an approved document |

### 3.2 Documentation Values

| Value | Description |
|-------|-------------|
| **Accuracy** | Documentation reflects reality; no aspirational documentation |
| **Completeness** | All required information is present |
| **Consistency** | Same terminology, format, and structure across all documents |
| **Currency** | Documentation is kept up-to-date with implementation |
| **Accessibility** | Documentation is easy to find and navigate |

---

## 4. Source of Truth Hierarchy

### 4.1 Hierarchy Definition

| Level | Document Type | Authority |
|-------|--------------|-----------|
| **1** | Product Vision | Highest |
| **2** | Roadmap | High |
| **3** | Approved Engineering Specifications | High |
| **4** | Platform Standards | High |
| **5** | Architecture Documents | High |
| **6** | UI/UX Documentation | Medium |
| **7** | Implementation Documentation | Lowest |

### 4.2 Hierarchy Rules

| Rule | Description |
|------|-------------|
| **No contradiction** | Lower-level documents must never contradict higher-level documents |
| **Derivation** | Lower-level documents derive authority from higher-level documents |
| **Specificity** | Lower-level documents may be more specific than higher-level documents |
| **Gap filling** | Lower-level documents may fill gaps not addressed by higher-level documents |
| **Conflict resolution** | In case of conflict, the higher-level document prevails |

### 4.3 Application Examples

| Scenario | Resolution |
|----------|-----------|
| Engineering specification contradicts Product Vision | Engineering specification must be updated to align |
| Architecture contradicts Engineering specification | Architecture document prevails; specification must be updated |
| Implementation contradicts Architecture | Implementation must be updated to align |
| UI/UX design contradicts Architecture | UI/UX design must be updated to align |
| Code contradicts documentation | Code or documentation must be updated to align |

---


## 5. Source Conflict Resolution

### 5.1 Conflict Resolution Process

When two approved documents contain conflicting guidance, the following mandatory process applies:

| Step | Action |
|------|--------|
| 1 | Follow the higher document in the Source of Truth Hierarchy (§4.1) |
| 2 | Flag the conflict immediately |
| 3 | Do not independently resolve conflicting guidance |
| 4 | Record the issue under Outstanding Design Decisions (§19.3) |
| 5 | Await human approval before continuing |

### 5.2 AI Limitations

| Rule | Description |
|------|-------------|
| **No independent resolution** | AI assistants are never permitted to choose between conflicting authoritative sources |
| **Flag, don't decide** | AI must flag conflicts and wait for human resolution |
| **Document the conflict** | All conflicts must be recorded with both source documents cited |
| **Continue only after resolution** | Implementation must not proceed until the conflict is resolved |

### 5.3 Conflict Documentation

| Field | Description |
|-------|-------------|
| **Conflicting Source A** | First document and specific section |
| **Conflicting Source B** | Second document and specific section |
| **Nature of Conflict** | Description of the contradictory guidance |
| **Recommended Resolution** | Suggested resolution (for human review only) |
| **Status** | Pending / Under Review / Resolved |

---

## 6. Human Approval Boundary

### 6.1 Reserved Decisions

The following decisions require explicit human approval and may never be approved or made independently by AI assistants:

| Category | Examples |
|----------|---------|
| **Business requirements** | Feature scope, user stories, acceptance criteria |
| **Product scope** | Which features are included or excluded |
| **Roadmap changes** | Timeline adjustments, priority changes |
| **Architecture changes** | Technology changes, pattern changes, structural changes |
| **Database redesign** | Schema restructuring, tenant isolation changes |
| **Security policy changes** | Authentication mechanism changes, permission model changes |
| **UI/UX philosophy changes** | Design system changes, interaction pattern changes |
| **Platform standards** | Changes to engineering, development, or DevOps standards |
| **Breaking changes** | Any change that breaks backward compatibility |
| **Versioning strategy** | Changes to versioning or release process |

### 6.2 AI Delegation Limits

| AI May | AI May Not |
|--------|-----------|
| Implement approved features | Decide which features to implement |
| Follow approved patterns | Choose new patterns |
| Generate code per specifications | Invent new specifications |
| Document approved decisions | Make architectural decisions |
| Flag issues for review | Resolve issues independently |

---

## 7. Design Governance

### 7.1 Design Rules

| Rule | Description |
|------|-------------|
| **Never invent design patterns** | Design patterns come only from approved design documentation |
| **Never create undocumented components** | New components must be documented before reuse |
| **Never bypass the approved Design System** | All UI must use approved design tokens and components |
| **All Figma designs use approved tokens** | Design tokens must match the approved design system |
| **New components documented first** | New components must be documented before being used |
| **Visual consistency** | Maintain visual consistency across the entire platform |
| **Traceable decisions** | Design decisions must remain traceable to approved documentation |

### 7.2 Design System Compliance

| Requirement | Description |
|-------------|-------------|
| **Design tokens** | Use approved color, typography, spacing, and component tokens |
| **Component library** | Use components from the approved component library |
| **Responsive design** | Follow approved responsive design guidelines |
| **Accessibility** | Follow approved accessibility standards |
| **Documentation** | All new components must be documented in the design system |

### 7.3 Design Documentation Requirements

| Artifact | Documentation Required |
|----------|----------------------|
| New component | Component specification with props, states, variants |
| New pattern | Pattern documentation with usage guidelines |
| Design token change | Token documentation with rationale |
| Interaction change | Interaction specification with user flow |

---

## 8. Implementation Governance

### 8.1 Mandatory Implementation Rules

| Rule | Description |
|------|-------------|
| **Read documentation first** | Read all relevant documentation before writing code |
| **Never implement undocumented behaviour** | Implementation must trace to approved specifications |
| **Never bypass architecture** | Follow approved architecture without exception |
| **Never bypass engineering standards** | Follow all Platform Standards without exception |
| **Never skip required testing** | All required tests must be written |
| **Traceable implementation** | Every implementation decision traces to an approved document |
| **Update documentation** | Update documentation whenever implementation changes require it |
| **No non-compliant merges** | Do not merge implementation that violates approved documentation |

### 8.2 Implementation Traceability

| From | To | Requirement |
|------|----|-------------|
| Code module | Specification | Every code module traces to a specification |
| API endpoint | API Style Guide | Every endpoint follows API Style Guide |
| Database change | Database Architecture | Every schema change follows Database Architecture |
| Event | Event Catalogue | Every event is defined in Platform Event Catalogue |
| Test | Acceptance criteria | Every test traces to an acceptance criteria |

---

## 9. AI Success Principles

### 9.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **Correctness before speed** | Accurate output is more valuable than fast output |
| **Consistency before creativity** | Consistent output is more valuable than creative output |
| **Reuse before reinvention** | Reuse existing patterns and content before creating new ones |
| **Explicit uncertainty over undocumented assumptions** | Flag uncertainty rather than inventing answers |
| **Architecture compliance before implementation convenience** | Follow architecture even when it is inconvenient |
| **Long-term maintainability over short-term optimisation** | Write code that is maintainable, not just fast to write |

### 9.2 Behaviour Expectations

| Expectation | Description |
|-------------|-------------|
| **Be precise** | Generate accurate, exact output |
| **Be consistent** | Follow established patterns exactly |
| **Be conservative** | Prefer existing solutions over new ones |
| **Be transparent** | Flag uncertainties and gaps explicitly |
| **Be compliant** | Follow all approved documentation |
| **Be maintainable** | Write code that is easy to maintain |

---

## 10. Prompt Execution Workflow

### 10.1 Required Workflow

Every AI task must follow this workflow:

| Step | Action |
|------|--------|
| 1 | Read the Documentation Constitution |
| 2 | Identify the task type |
| 3 | Load all relevant approved documentation |
| 4 | Validate the Source of Truth hierarchy |
| 5 | Determine whether sufficient information exists |
| 6 | Flag missing information instead of making assumptions |
| 7 | Produce the requested output |
| 8 | Perform the mandatory AI Self-Review (§25) |

### 10.2 Workflow Rules

| Rule | Description |
|------|-------------|
| **Complete all steps** | No step may be skipped |
| **Document context loaded** | Record which documents were read |
| **Flag gaps** | Identify missing information before producing output |
| **Self-review mandatory** | Complete self-review before considering task complete |

---

## 11. Context Loading Requirements

### 11.1 Required Context

AI assistants must load all relevant project context before beginning work:

| Context Type | When Required |
|-------------|---------------|
| **Documentation Constitution** | Always |
| **Engineering Specifications** | When implementing domain features |
| **Platform Standards** | When writing code or documentation |
| **Architecture Documents** | When making architectural decisions |
| **UI/UX Documentation** | When working on design or frontend |
| **ADRs** | When making or reviewing architectural decisions |
| **Roadmap** | When planning implementation order |
| **Existing implementation** | When extending or modifying existing code |
| **Previous related documentation** | When creating related documentation |

### 11.2 Context Loading Rules

| Rule | Description |
|------|-------------|
| **Relevant context only** | Only load documentation relevant to the current task |
| **Avoid context overflow** | Do not load unnecessary documentation |
| **Sufficient context** | Ensure enough context is loaded for accurate work |
| **Document what was loaded** | Record which documents were read for the task |

---


---

## 12. Documentation Principles

### 12.1 Derivation Principle

| Rule | Description |
|------|-------------|
| **Derive, don't invent** | All content must derive from approved sources |
| **Reference, don't duplicate** | Reference existing documents instead of copying content |
| **Extend, don't contradict** | Extend existing guidance without contradicting it |
| **Fill gaps, don't replace** | Fill documentation gaps without replacing existing content |

### 12.2 Consistency Principle

| Rule | Description |
|------|-------------|
| **Terminology** | Use the same terms for the same concepts everywhere |
| **Structure** | Follow consistent document structure |
| **Formatting** | Follow consistent formatting conventions |
| **Diagrams** | Follow consistent diagramming standards |

### 12.3 Traceability Principle

| Rule | Description |
|------|-------------|
| **Every decision traced** | Every architectural and implementation decision traces to an approved document |
| **Every requirement traced** | Every implementation traces to an approved specification |
| **Every change traced** | Every change traces to an approved change request |

### 12.4 Completeness Principle

| Rule | Description |
|------|-------------|
| **No incomplete sections** | Every section must be complete or marked as TODO with justification |
| **No placeholder content** | No lorem ipsum or placeholder text |
| **No hidden assumptions** | All assumptions must be documented in Outstanding Design Decisions |

---

## 13. AI Documentation Rules

### 13.1 Mandatory Rules

| Rule | Description |
|------|-------------|
| **Never invent business rules** | Business rules come only from approved specifications |
| **Never invent architecture** | Architectural decisions come only from approved architecture documents |
| **Never invent workflows** | Workflows come only from approved standards and specifications |
| **Never introduce new features** | New features require approved specifications |
| **Never contradict approved documentation** | All output must align with approved sources |
| **Never silently modify frozen documents** | Frozen documents require formal change requests |
| **Always reference existing documentation** | Read relevant documents before creating content |
| **Prefer referencing over duplication** | Reference documents instead of copying content |
| **Preserve terminology exactly** | Use the same terms as approved documentation |
| **Maintain consistent formatting** | Follow writing and formatting standards |

### 13.2 AI Content Generation Rules

| Rule | Description |
|------|-------------|
| **Derive from sources** | All generated content must derive from approved documentation |
| **Flag gaps** | Identify missing information instead of inventing it |
| **Ask when unsure** | Request clarification rather than making assumptions |
| **Document decisions** | Create ADRs for architectural decisions |
| **Include references** | Reference source documents for all derived content |

### 13.3 AI Code Generation Rules

| Rule | Description |
|------|-------------|
| **Read specifications first** | Always read relevant engineering specifications before coding |
| **Follow established patterns** | Use patterns from existing modules |
| **Never bypass standards** | Follow all Platform Standards without exception |
| **Traceable implementation** | Every implementation decision traces to a specification |
| **Tests included** | Generate tests alongside implementation |
| **Documentation updated** | Update documentation in the same commit |

### 13.4 AI Self-Check Requirements

| Check | Description |
|-------|-------------|
| **No assumptions** | Verify no undocumented assumptions were introduced |
| **No contradictions** | Verify no contradictions with approved documentation |
| **No inventions** | Verify no business rules, architecture, or workflows were invented |
| **References valid** | Verify all cross-references point to existing content |
| **Terminology consistent** | Verify terminology matches approved documentation |

---

## 14. Writing Standards

### 14.1 Language Standards

| Standard | Requirement |
|----------|-------------|
| **Clear technical writing** | Use precise, unambiguous language |
| **Implementation-oriented** | Focus on practical, actionable guidance |
| **Concise explanations** | Be brief while maintaining clarity |
| **No marketing language** | Avoid persuasive or promotional language |
| **No unnecessary repetition** | State information once; reference where needed |
| **Explain reasoning** | Explain why standards exist, not just what they are |

### 14.2 Document Structure Standards

| Standard | Requirement |
|----------|-------------|
| **Cover page** | Document title, version, status, date, classification |
| **Table of contents** | For documents > 20 sections |
| **Numbered sections** | All major sections numbered |
| **Revision history** | Version tracking at document end |
| **Consistent headers** | Same header format across all documents |

### 14.3 Formatting Standards

| Element | Standard |
|---------|---------|
| **Headings** | Use `#` for title, `##` for major sections, `###` for subsections |
| **Tables** | Use Markdown tables for structured data |
| **Lists** | Use `-` for unordered lists, `1.` for ordered lists |
| **Code** | Use fenced code blocks with language identifiers |
| **Emphasis** | Use `**bold**` for emphasis, `*italic*` for secondary emphasis |
| **Links** | Use relative paths for internal links |

---

## 15. Technical Standards

### 15.1 Document Technical Requirements

| Requirement | Description |
|-------------|-------------|
| **Encoding** | UTF-8 |
| **Line endings** | LF (Unix) |
| **Maximum line length** | 200 characters |
| **File naming** | `<number> <Document Name>.md` |
| **Directory structure** | Follow established directory hierarchy |

### 15.2 Diagram Technical Requirements

| Requirement | Description |
|-------------|-------------|
| **Syntax** | Mermaid syntax for all diagrams |
| **Rendering** | Must render correctly in GitHub/GitLab |
| **Complexity** | Avoid overly complex diagrams; split into multiple if needed |
| **Labels** | All nodes and edges must be labeled |

### 15.3 Code Technical Requirements

| Requirement | Description |
|-------------|-------------|
| **Language** | Specify language for all code blocks |
| **Completeness** | Code examples must be complete and runnable |
| **Accuracy** | Code examples must be accurate and tested |
| **Formatting** | Follow project coding standards |

---

## 16. Cross-Reference Standards

### 16.1 Cross-Reference Rules

| Rule | Description |
|------|-------------|
| **Required references** | Every document must reference relevant higher-level documents |
| **Internal references** | Use `§section number` format for internal references |
| **External references** | Use full document name and version for external references |
| **Valid references** | All references must point to existing content |
| **Current references** | References must be updated when target content changes |

### 16.2 Cross-Reference Format

| Reference Type | Format | Example |
|---------------|--------|---------|
| **Internal section** | `§<number>` | `§3.2` |
| **Internal document** | `<Document Name> §<number>` | `System Architecture §1.1` |
| **External document** | `<Document Name> v<version> §<number>` | `Platform Standards v1.0 §2.1` |
| **URL** | `<URL>` | `<https://...>` |

### 16.3 Cross-Reference Validation

| Validation | Description |
|-----------|-------------|
| **Existence** | Verify referenced content exists |
| **Accuracy** | Verify referenced content matches description |
| **Currency** | Verify referenced content is current |
| **Consistency** | Verify referenced content is consistent |

---

## 17. Terminology Standards

### 17.1 Mandatory Terminology

| Term | Definition | Usage |
|------|-----------|-------|
| **Institution** | An educational organization (school, college, university) | Always use "Institution" not "School" or "Organization" |
| **Tenant** | An isolated instance of the system for an institution | Always use "Tenant" not "Instance" or "Account" |
| **Student** | A person enrolled in an institution | Always use "Student" not "Learner" or "Pupil" |
| **Guardian** | A person responsible for a student | Always use "Guardian" not "Parent" |
| **Staff Member** | An employee of an institution | Always use "Staff Member" not "Employee" or "User" |
| **Domain Event** | A significant occurrence in a domain | Always use "Domain Event" not "Event" alone |
| **Aggregate** | A cluster of domain objects treated as a unit | Always use "Aggregate" not "Entity Group" |
| **Module** | A bounded context in the modular monolith | Always use "Module" not "Service" or "Component" |
| **Workspace** | A top-level organizational container | Always use "Workspace" not "Space" or "Area" |
| **Role** | A named collection of permissions | Always use "Role" not "Group" or "Permission Set" |
| **Permission** | A specific authorization to perform an action | Always use "Permission" not "Right" or "Privilege" |

### 17.2 Terminology Rules

| Rule | Description |
|------|-------------|
| **Never rename** | Do not rename concepts that already exist |
| **Never alias** | Do not create alternative names for the same concept |
| **Use approved terms** | Always use the terms defined in this Constitution |
| **Flag inconsistencies** | Report terminology inconsistencies when found |

### 17.3 New Term Process

| Step | Action |
|------|--------|
| 1 | Identify need for new term |
| 2 | Check if existing term covers the concept |
| 3 | If new term needed: document definition |
| 4 | Add to terminology table |
| 5 | Update all references |

---

## 18. Architecture Protection Rules

### 18.1 Frozen Architecture Rules

| Rule | Description |
|------|-------------|
| **No unauthorized changes** | Frozen architecture cannot be changed without formal approval |
| **ADR authority** | Architecture Decision Records remain authoritative |
| **Implementation compliance** | Implementation must follow approved architecture |
| **Design alignment** | Design documents must align with architecture |
| **Code alignment** | Code must align with documentation |

### 18.2 Architecture Change Rules

| Rule | Description |
|------|-------------|
| **Formal process** | All architecture changes follow the change control process |
| **Impact analysis** | All changes require impact analysis |
| **Approval required** | All changes require appropriate approval level |
| **Documentation update** | All approved changes require documentation updates |
| **ADR creation** | All architectural decisions require ADRs |

### 18.3 Architecture Compliance Rules

| Rule | Description |
|------|-------------|
| **Specification compliance** | Implementation matches approved specifications |
| **Standards compliance** | Implementation follows Platform Standards |
| **Schema compliance** | Database changes follow Database Architecture |
| **API compliance** | API endpoints follow API Style Guide |
| **Event compliance** | Events follow Platform Event Catalogue |

---

## 19. Assumption Policy

### 19.1 Assumption Prohibition

| Rule | Description |
|------|-------------|
| **No undocumented assumptions** | All assumptions must be documented |
| **No guessed business rules** | Business rules come only from approved specifications |
| **No invented architecture** | Architecture comes only from approved documents |
| **No assumed workflows** | Workflows come only from approved standards |

### 19.2 Handling Missing Information

When required information is missing:

| Step | Action |
|------|--------|
| 1 | Do NOT guess or invent |
| 2 | Flag the missing information |
| 3 | Explain why it is required |
| 4 | Suggest possible options only if requested |
| 5 | Record the issue in Outstanding Design Decisions |

### 19.3 Outstanding Design Decisions

| Rule | Description |
|------|-------------|
| **Location** | All outstanding decisions are recorded in a dedicated section |
| **Format** | Each decision includes: question, context, options, recommendation |
| **Tracking** | Outstanding decisions are tracked until resolved |
| **Resolution** | Resolved decisions are documented as ADRs |

### 19.4 Outstanding Design Decisions Template

| Field | Description |
|-------|-------------|
| **Question** | What decision needs to be made? |
| **Context** | Why is this decision needed? |
| **Options** | What are the possible choices? |
| **Recommendation** | What is the recommended choice? |
| **Status** | Pending / Under Review / Resolved |
| **Resolution** | How was the decision resolved? (when resolved) |

---

## 20. Review Standards

### 20.1 Review Requirements

| Requirement | Description |
|-------------|-------------|
| **Completeness** | All required sections are present |
| **Consistency** | No contradictions within the document |
| **Missing information** | No required information is missing |
| **Cross-reference validation** | All references are valid |
| **Terminology validation** | All terminology matches approved terms |
| **Architecture compliance** | No architectural contradictions |
| **Outstanding design decisions** | All assumptions are documented |

### 20.2 Review Process

| Step | Action |
|------|--------|
| 1 | Complete the document |
| 2 | Perform AI self-review |
| 3 | Run quality assurance checklist |
| 4 | Submit for human review |
| 5 | Address review feedback |
| 6 | Final approval |

### 20.3 Review Checklist

| # | Check |
|---|-------|
| 1 | All required sections present |
| 2 | Cross-references valid |
| 3 | No undocumented assumptions |
| 4 | Terminology consistent |
| 5 | Architecture compliant |
| 6 | Diagrams validated |
| 7 | Internal consistency confirmed |

---


---

## 21. Quality Assurance Checklist

### 21.1 Document Quality Checklist

| # | Check | Category |
|---|-------|----------|
| 1 | Cover page present | Structure |
| 2 | Table of contents present (if > 20 sections) | Structure |
| 3 | All sections numbered | Structure |
| 4 | Revision history present | Structure |
| 5 | Version number correct | Versioning |
| 6 | Status accurate | Versioning |
| 7 | No contradictions | Consistency |
| 8 | Terminology consistent | Consistency |
| 9 | Formatting consistent | Consistency |
| 10 | Cross-references valid | References |
| 11 | No broken links | References |
| 12 | Diagrams render correctly | Technical |
| 13 | Code examples accurate | Technical |
| 14 | No placeholder content | Content |
| 15 | No marketing language | Content |

### 21.2 Technical Quality Checklist

| # | Check |
|---|-------|
| 1 | File encoding UTF-8 |
| 2 | Line endings LF |
| 3 | No trailing whitespace |
| 4 | No mixed line endings |
| 5 | File naming follows convention |

---

## 22. Versioning & Change Management

### 22.1 Version Numbering

| Format | Example | Usage |
|--------|---------|-------|
| `Major.Minor` | `1.0` | Standard versioning |
| `Major.Minor.Patch` | `1.0.1` | Hotfix or critical correction |

### 22.2 Version Change Rules

| Change Type | When to Use |
|-------------|-------------|
| **Major** (1.0 → 2.0) | Significant restructuring or scope change |
| **Minor** (1.0 → 1.1) | New sections, clarifications, non-breaking additions |
| **Patch** (1.0.0 → 1.0.1) | Typo fixes, formatting corrections |

### 22.3 Document Status

| Status | Definition | Modification Allowed |
|--------|-----------|---------------------|
| **DRAFT** | Being written or revised | Yes, by author |
| **REVIEW** | Under review | Yes, based on feedback |
| **FROZEN** | Approved and baseline | Only via formal change request |
| **SUPERSEDED** | Replaced by newer version | No |

### 22.4 Change Management Rules

| Rule | Description |
|------|-------------|
| **Formal process** | All changes to frozen documents follow formal process |
| **Impact analysis** | All changes require impact analysis |
| **Approval required** | All changes require appropriate approval |
| **Documentation updated** | All changes require documentation updates |
| **Version incremented** | All changes require version number increment |

---

## 23. Diagram Standards

### 23.1 Diagram Types

| Type | Usage |
|------|-------|
| **Flowchart** | Process flows, decision trees |
| **Sequence** | Interaction between components over time |
| **Class** | Class structure and relationships |
| **State** | State transitions |
| **ER** | Database entity relationships |
| **Gitgraph** | Branching and merging strategies |
| **Architecture** | System architecture overviews |

### 23.2 Diagram Rules

| Rule | Description |
|------|-------------|
| **Mermaid syntax** | All diagrams use Mermaid syntax |
| **Meaningful names** | All nodes have meaningful labels |
| **Consistent style** | Consistent colors, shapes, and layouts |
| **Appropriate detail** | Right level of abstraction for audience |
| **Support, don't duplicate** | Diagrams support text, not replace it |

### 23.3 Diagram Formatting

| Element | Standard |
|---------|---------|
| **Orientation** | Top-to-bottom for flows; left-to-right for sequences |
| **Colors** | Use consistent color coding for node types |
| **Shapes** | Use appropriate shapes for different node types |
| **Labels** | Keep labels concise but descriptive |
| **Subgraphs** | Use subgraphs to group related elements |

---

## 24. Traceability Requirements

### 24.1 Traceability Matrix

| From | To | Requirement |
|------|----|-------------|
| Implementation | Specification | Every implementation traces to a specification |
| Specification | Product Vision | Every specification traces to product vision |
| Code | Documentation | Every code module has corresponding documentation |
| Event | Event Catalogue | Every event is defined in Platform Event Catalogue |
| API | API Style Guide | Every API follows API Style Guide |
| Schema | Database Architecture | Every schema change follows Database Architecture |

### 24.2 Traceability Rules

| Rule | Description |
|------|-------------|
| **Bidirectional** | Traceability works both ways |
| **Current** | Traceability links are kept up-to-date |
| **Valid** | Traceability links point to existing content |
| **Auditable** | Traceability can be verified |

---

## 25. AI Self-Review Process

### 25.1 Pre-Completion Self-Review

Before considering any document complete, OpenCode must verify:

| # | Check |
|---|-------|
| ✓ | No assumptions introduced |
| ✓ | No conflicting terminology |
| ✓ | No duplicated guidance |
| ✓ | No architectural conflicts |
| ✓ | References validated |
| ✓ | Diagrams validated |
| ✓ | Internal consistency confirmed |
| ✓ | All required sections present |
| ✓ | Cross-references valid |
| ✓ | Terminology matches approved documentation |

### 25.2 Self-Review Process

| Step | Action |
|------|--------|
| 1 | Read the complete document |
| 2 | Check each self-review item |
| 3 | Verify cross-references |
| 4 | Verify terminology |
| 5 | Verify diagrams |
| 6 | Verify internal consistency |
| 7 | Document any issues found |
| 8 | Fix issues before submission |

### 25.3 Self-Review Output

| Output | Description |
|--------|-------------|
| **Pass** | Document passes all self-review checks |
| **Conditional pass** | Document passes with minor issues to fix |
| **Fail** | Document fails one or more checks; must be revised |

---

## 26. Completion Criteria

### 26.1 Document Completion

A document is complete only when:

| # | Criterion |
|---|-----------|
| 1 | All required sections are present |
| 2 | Cross-references are correct |
| 3 | No assumptions remain undocumented |
| 4 | All terminology matches approved documentation |
| 5 | The document passes the AI Self-Review |
| 6 | The document is ready for human architectural review |

### 26.2 Implementation Completion

Implementation is complete only when:

| # | Criterion |
|---|-----------|
| 1 | Implementation matches approved specifications |
| 2 | All tests are passing |
| 3 | Documentation is updated |
| 4 | Code review is approved |
| 5 | Architecture review is approved |

### 26.3 Release Completion

Release is complete only when:

| # | Criterion |
|---|-----------|
| 1 | All modules are complete |
| 2 | All tests are passing |
| 3 | All documentation is current |
| 4 | All security reviews are passed |
| 5 | All performance targets are met |
| 6 | All approval gates are passed |

---

## 27. Constitution Summary

### 27.1 Core Rules

| Rule | Description |
|------|-------------|
| **Derive, don't invent** | All content derives from approved sources |
| **Reference, don't duplicate** | Reference documents instead of copying |
| **Flag gaps, don't guess** | Identify missing information instead of inventing |
| **Follow terminology** | Use approved terms consistently |
| **Protect architecture** | Follow architecture protection rules |
| **Document assumptions** | Record all assumptions in Outstanding Design Decisions |
| **Self-review** | Complete AI self-review before submission |
| **Maintain traceability** | Keep traceability links current |

### 27.2 Enforcement

| Enforcement | Description |
|-------------|-------------|
| **Code review** | Verify compliance during code review |
| **Documentation review** | Verify compliance during documentation review |
| **Architecture review** | Verify compliance during architecture review |
| **AI self-review** | AI verifies compliance before submission |

### 27.3 Amendment Process

| Step | Action |
|------|--------|
| 1 | Identify need for amendment |
| 2 | Document proposed change |
| 3 | Assess impact |
| 4 | Obtain approval |
| 5 | Update Constitution |
| 6 | Increment version |
| 7 | Notify team |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | July 2026 | Architecture Team | Initial constitution |
| 1.1 | July 2026 | Architecture Team | Added Source Conflict Resolution, Human Approval Boundary, Design Governance, Implementation Governance, AI Success Principles, Prompt Execution Workflow, Context Loading Requirements |

---

*Document Version: 1.1*  
*Last Updated: July 2026*  
*Status: Approved*  
*Classification: Internal*

---

**END OF DOCUMENT**

