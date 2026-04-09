---
type: "agent_requested"
description: "Documentation Best Practices"
---

# Documentation

When producing documentation, follow the paradigm of "agile documentation" as described at https://agilemodeling.com/essays/agiledocumentation.htm

- The fundamental issue is communication, not documentation.
- Agilists write documentation if that’s the best way to achieve the relevant goals, but there often proves to be better ways to achieve those goals than writing static documentation.
- Document stable things, not speculative things.
- Take an evolutionary approach to documentation development, seeking and then acting on feedback on a regular basis.
- Prefer executable work products such as customer tests and developer tests over static work products such as plain old documentation (POD).
- You should understand the total cost of ownership (TCO) for a document, and someone must explicitly choose to make that investment.
- Well-written documentation supports organizational memory effectively, but is a poor way to communicate during an initiative.
- Documentation should be concise: overviews/roadmaps are generally preferred over detailed documentation.
- With high quality source code and a test suite to back it up you need a lot less system documentation.
- Travel as light as you possibly can.
- Documentation should be just barely good enough.
- Comprehensive documentation does not ensure success, in fact, it increases your chance of failure.
- Models are not necessarily documents, and documents are not necessarily models.
- Documentation is as much a part of the system as the source code.
- Your team’s primary goal is to develop software, its secondary goal is to enable your next effort.
- The benefit of having documentation must be greater than the cost of creating and maintaining it.
- Developers rarely trust the documentation, particularly detailed documentation because it’s usually out of sync with the code.
- Each system has its own unique documentation needs, one size does not fit all.
- Ask whether you NEED the documentation, not whether you want it.
- The investment in system documentation is a business decision, not a technical one.
- Create documentation only when you need it at the appropriate point in the lifecycle.
- Update documentation only when it hurts.

# Documentation Principles

- Documents maximize stakeholder ROI.
- Stakeholders know the TCO of the document. 
- Documents are “lean and sufficient”. 
- Documents fulfill a purpose.
- Documents describe “good things to know”.
- Documents are sufficiently accurate, consistent, and detailed.

# General Rules
- Produce documentation in Markdown format.
- Place general project documentation into a `docs` folder in the root of the project, with a coherent structure.
- Specific documentation for packages/modules/components should be agreed upfront on where to place it.


# Code Comments

## Focus
- **"Why" Over "What"**: Write comments when the "why" behind the code is not obvious
- **Intent and Reasoning**: Focus comments on intent, reasoning, or trade-offs rather than describing what the code does
- **Let Code Speak**: Allow the code itself to convey the "what" through clear naming and structure
- **Business Logic**: Comment complex business rules, algorithms, or domain-specific logic that may not be immediately clear

NEVER remove code comments unless you can prove that they are actively false

## Evergreen Comment Standards

- **No Temporal References**: Do not refer to temporal context about refactors or recent changes in comments
- **Describe Current State**: Comments should describe the code as it is, not how it evolved or was recently changed
- **Avoid Historical Context**: Remove references to "recently added", "temporary fix", "TODO: refactor later", etc.
- **Timeless Documentation**: Write comments that remain relevant regardless of when they are read

