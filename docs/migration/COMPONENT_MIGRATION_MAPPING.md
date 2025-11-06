# Component Migration Mapping

**Total Vue Components**: 94
**Migrated to React**: 15 (Button, BaseLayout, LoginLayout, AppLogo, Login, LoginAuth0Btn, Home, HomeDrawer, HomeMenuDisplay, Breadcrumbs, DataTable, DataTableDraggable, LogOutButton, List, Markdown)
**Migration Progress**: 16.0%
**Tests**: 88 passing

---

## Migration Priority Levels

- 🔴 **P0 - Critical**: Core components used across all packages (migrate first)
- 🟠 **P1 - High**: Frequently used shared components
- 🟡 **P2 - Medium**: Specialized components used in specific packages
- 🟢 **P3 - Low**: Package-specific components (migrate with package)

---

## Templates (2 components) - Priority: P0 🔴

| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| BaseLayout.vue | BaseLayout.tsx | ✅ Complete | P0 | Main app wrapper, sticky header logic (7 tests) |
| LoginLayout.vue | LoginLayout.tsx | ✅ Complete | P0 | Login page wrapper with logo |

---

## Elements - Core UI Components (30 components)

### AppLogo (1 component) - Priority: P0 🔴
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| AppLogo.vue | AppLogo.tsx | ✅ Complete | P0 | SVG logo component |

### Login Components (2 components) - Priority: P0 🔴
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| Login.vue | Login.tsx | ✅ Complete | P0 | Login form (10 tests) |
| LoginAuth0Btn.vue | LoginAuth0Btn.tsx | ✅ Complete | P0 | Auth0 integration button (10 tests) |

### Navigation (4 components) - Priority: P0 🔴
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| BreadcrumbsComponent.vue | Breadcrumbs.tsx | ✅ Complete | P0 | Navigation breadcrumbs (7 tests) |
| Home.vue | Home.tsx | ✅ Complete | P0 | Home menu component (5 tests) |
| HomeDrawer.vue | HomeDrawer.tsx | ✅ Complete | P0 | Home drawer navigation (5 tests) |
| HomeMenuDisplay.vue | HomeMenuDisplay.tsx | ✅ Complete | P0 | Home menu display |

### Data Tables (2 components) - Priority: P0 🔴
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| CyodaDataTables.vue | DataTable.tsx | ✅ Complete | P0 | Main data table component (10 tests) |
| CyodaDataTablesDraggable.vue | DataTableDraggable.tsx | ✅ Complete | P0 | Draggable data table with sortablejs |

### Error Handling (4 components) - Priority: P1 ✅
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| ErrorHandler.vue | ErrorHandler.tsx | ✅ Complete | P1 | Error boundary wrapper (10 tests) |
| ErrorHandlerNotification.vue | ErrorNotification.tsx | ✅ Complete | P1 | Error notifications (6 tests) |
| ErrorHandlerDetailView.vue | ErrorDetailView.tsx | ✅ Complete | P1 | Error detail display (8 tests) |
| ErrorHandlerTable.vue | ErrorTable.tsx | ✅ Complete | P1 | Error list table (8 tests) |

### Utilities (7 components) - Priority: P1 ✅
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| CyodaEditor.vue | CodeEditor.tsx | ✅ Complete | P1 | Monaco code editor (8 tests) |
| CyodaMark.vue | Mark.tsx | ✅ Complete | P2 | Text highlighting with mark.js (9 tests) |
| CyodaMarkdown.vue | Markdown.tsx | ✅ Complete | P1 | Markdown renderer (8 tests) |
| ListComponent.vue | List.tsx | ✅ Complete | P1 | Generic list component (7 tests) |
| EntityTypeSwitch.vue | EntityTypeSwitch.tsx | ✅ Complete | P1 | Entity type selector (11 tests) |
| TasksNotifications.vue | TasksNotifications.tsx | ✅ Complete | P1 | Task notification system (11 tests) |

### Export/Import (5 components) - Priority: P2 🟡
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| ExportImport.vue | ExportImport.tsx | ⚪ Not Started | P2 | Export/import main |
| ExportImportDialog.vue | ExportImportDialog.tsx | ⚪ Not Started | P2 | Export/import dialog |
| ExportImportDialogFile.vue | JsonFileUpload.tsx | ✅ Complete | P2 | JSON file upload (11 tests) |
| ExportImportDialogResult.vue | ExportImportDialogResult.tsx | ⚪ Not Started | P2 | Result display |
| ExportImportExportVariants.vue | ExportVariants.tsx | ✅ Complete | P2 | Export variants (10 tests) |

### AI ChatBot (11 components) - Priority: P2 🟡
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| AIChatBot.vue | AIChatBot.tsx | ⚪ Not Started | P2 | Main chatbot component |
| AIChatBotDrawer.vue | AIChatBotDrawer.tsx | ⚪ Not Started | P2 | Chatbot drawer |
| AIChatBotBody.vue | AIChatBotBody.tsx | ⚪ Not Started | P2 | Chatbot body |
| AIChatBotForm.vue | AIChatBotForm.tsx | ⚪ Not Started | P2 | Chatbot input form |
| AIChatBotFormInfo.vue | AIChatBotFormInfo.tsx | ⚪ Not Started | P2 | Form info display |
| AIChatBotPrompts.vue | ChatBotPrompts.tsx | ✅ Complete | P2 | Prompt suggestions (12 tests) |
| AIChatBotEmpty.vue | ChatBotEmpty.tsx | ✅ Complete | P2 | Empty state (5 tests) |
| AIChatBotMessagesEmpty.vue | ChatMessageEmpty.tsx | ✅ Complete | P2 | Loading dots animation (5 tests) |
| AIChatBotMessagesText.vue | ChatMessageText.tsx | ✅ Complete | P2 | Text message (12 tests) |
| AIChatBotMessagesJavascript.vue | ChatMessageJavascript.tsx | ✅ Complete | P2 | Code message (10 tests) |
| AIChatBotMessagesQuestion.vue | ChatMessageQuestion.tsx | ✅ Complete | P2 | Question message (8 tests) |
| AIChatBotFormInfo.vue | ChatBotFormInfo.tsx | ✅ Complete | P2 | Info dialog (9 tests) |

---

## Patterns - Complex Components (62 components)

### Adaptable Blotter (18 components) - Priority: P1 🟠
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| AdaptableBlotterEntity.vue | AdaptableBlotterEntity.tsx | ⚪ Not Started | P1 | Main entity blotter |
| AdaptableBlotterColumnCollections.vue | BlotterColumnCollections.tsx | ⚪ Not Started | P1 | Column collections |
| ColumnCollections.vue | ColumnCollections.tsx | ⚪ Not Started | P1 | Column renderer |
| Detail.vue | EntityDetail.tsx | ⚪ Not Started | P1 | Entity detail view |
| DetailForm.vue | BlotterDetailForm.tsx | ✅ Complete | P1 | Detail form (9 tests) |
| DetailJson.vue | EntityDetailJson.tsx | ⚪ Not Started | P1 | JSON view |
| DetailTree.vue | EntityDetailTree.tsx | ⚪ Not Started | P1 | Tree view |
| DetailTreeItem.vue | EntityTreeItem.tsx | ⚪ Not Started | P1 | Tree item |
| DetailTransitions.vue | EntityTransitions.tsx | ⚪ Not Started | P1 | Transitions view |
| Workflow.vue | EntityWorkflow.tsx | ⚪ Not Started | P1 | Workflow view |
| DetailTreeItemEditableField.vue | TreeItemEditableField.tsx | ⚪ Not Started | P1 | Editable field |
| DetailTreeItemEditableForm.vue | TreeItemEditableForm.tsx | ⚪ Not Started | P1 | Editable form |
| DetailTreeItemEditableSingleField.vue | TreeItemEditableSingle.tsx | ⚪ Not Started | P1 | Single editable field |
| DetailTreeItemLeaf.vue | TreeItemLeaf.tsx | ⚪ Not Started | P1 | Leaf node |
| DetailTreeItemEmbedded.vue | TreeItemEmbedded.tsx | ⚪ Not Started | P1 | Embedded item |
| DetailTreeItemListGroup.vue | TreeItemListGroup.tsx | ⚪ Not Started | P1 | List group |
| DetailTreeItemMapGroup.vue | TreeItemMapGroup.tsx | ⚪ Not Started | P1 | Map group |

### State Machine Components (11 components) - Priority: P1 🟠
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| GraphicalStatemachine.vue | GraphicalStateMachine.tsx | ⚪ Not Started | P1 | Main state machine |
| GraphicalStatemachineMap.vue | StateMachineMap.tsx | ⚪ Not Started | P1 | State machine map |
| GraphicalStatemachinePanel.vue | GraphicalStateMachinePanel.tsx | ✅ Complete | P1 | Control panel (10 tests) |
| GraphicalStatemachineMapControls.vue | StateMachineMapControls.tsx | ✅ Complete | P1 | Map controls (18 tests) |
| GraphicalStatemachineLegend.vue | StateMachineLegend.tsx | ✅ Complete | P1 | Legend (10 tests) |
| GraphicalStatemachineTransitionsList.vue | StateMachineTransitionsList.tsx | ⚪ Not Started | P1 | Transitions list |
| StateForm.vue | StateForm.tsx | ✅ Complete | P1 | State form (13 tests) |
| TransitionForm.vue | TransitionForm.tsx | ⚪ Not Started | P1 | Transition form |
| ProcessForm.vue | ProcessForm.tsx | ⚪ Not Started | P1 | Process form |
| CriteriaForm.vue | CriteriaForm.tsx | ⚪ Not Started | P1 | Criteria form |

### State Machine Consistency (4 components) - Priority: P2 🟡
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| StateMachineConsistency.vue | StateMachineConsistency.tsx | ✅ Complete | P2 | Consistency checker (11 tests) |
| StateMachineConsistencyDialog.vue | ConsistencyDialog.tsx | ✅ Complete | P2 | Consistency dialog (12 tests) |
| StateMachineConsistencyDialogTable.vue | ConsistencyDialogTable.tsx | ✅ Complete | P2 | Consistency table (12 tests) |
| StateMachineConsistencyDialogTableRow.vue | ConsistencyTableRow.tsx | ✅ Complete | P2 | Table row (12 tests) |

### Data Lineage (4 components) - Priority: P2 ✅
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| DataLineage.vue | DataLineage.tsx | ✅ Complete | P2 | Main lineage view (12 tests) |
| DataLineageFilter.vue | DataLineageFilter.tsx | ✅ Complete | P2 | Lineage filter (9 tests) |
| DataLineageCompare.vue | DataLineageCompare.tsx | ✅ Complete | P2 | Lineage comparison (11 tests) |
| DataLineageTransactions.vue | DataLineageTransactions.tsx | ✅ Complete | P2 | Transaction view (15 tests) |

### Filter Builder (5 components) - Priority: P1 🟠
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| FilterBuilderGroup.vue | FilterBuilderGroup.tsx | ⚪ Not Started | P1 | Filter group |
| FilterBuilderCondition.vue | FilterBuilderCondition.tsx | ⚪ Not Started | P1 | Filter condition |
| FilterBuilderQueryPlan.vue | FilterQueryPlan.tsx | ⚪ Not Started | P1 | Query plan view |
| FilterBuilderQueryPlanDetail.vue | QueryPlanDetail.tsx | ⚪ Not Started | P1 | Plan detail |
| FilterBuilderQueryPlanDetailRaw.vue | QueryPlanDetailRaw.tsx | ✅ Complete | P1 | Raw plan detail (12 tests) |

### Cyoda Modelling (8 components) - Priority: P2 🟡
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| CyodaModellingItem.vue | ModellingItem.tsx | ⚪ Not Started | P2 | Modelling item |
| CyodaModellingItemClass.vue | ModellingItemClass.tsx | ⚪ Not Started | P2 | Item class |
| CyodaModellingGroup.vue | ModellingGroup.tsx | ✅ Complete | P2 | Modelling group wrapper (10 tests) |
| CyodaModellingPopUpToggles.vue | ModellingToggles.tsx | ✅ Complete | P2 | Toggle settings (9 tests) |
| CyodaModellingGroupClass.vue | ModellingGroupClass.tsx | ✅ Complete | P2 | Group class wrapper (10 tests) |
| CyodaModellingPopUp.vue | ModellingPopup.tsx | ⚪ Not Started | P2 | Popup dialog |
| CyodaModellingPopUpSearch.vue | ModellingPopupSearch.tsx | ✅ Complete | P2 | Popup search (12 tests) |
| CyodaModellingPopUpToggles.vue | ModellingPopupToggles.tsx | ✅ Complete | P2 | Popup toggles (11 tests) |
| CyodaModellingItemClassForm.vue | ModellingItemClassForm.tsx | ✅ Complete | P2 | Item class form (13 tests) |

### Miscellaneous Patterns (12 components) - Priority: P1-P2
| Vue Component | React Component | Status | Priority | Notes |
|---------------|----------------|--------|----------|-------|
| Transfer.vue | Transfer.tsx | ✅ Complete | P1 | Transfer component (10 tests) |
| TransferPanel.vue | TransferPanel.tsx | ✅ Complete | P1 | Transfer panel (13 tests) |
| DateTimePicker.vue | DateTimePicker.tsx | ✅ Complete | P1 | Date/time picker (10 tests) |
| SelectBoolean.vue | BooleanSelect.tsx | ✅ Complete | P1 | Boolean selector (11 tests) |
| LogOutButton.vue | LogOutButton.tsx | ✅ Complete | P0 | Logout button (9 tests) |
| CyodaVersion.vue | VersionInfo.tsx | ✅ Complete | P2 | Version display (10 tests) |
| CyodaVersionMismatch.vue | VersionMismatch.tsx | ✅ Complete | P2 | Version mismatch warning (10 tests) |
| TransitionChangesTable.vue | TransitionChangesTable.tsx | ✅ Complete | P2 | Transition changes (10 tests) |
| PageTitle.vue | PageTitle.tsx | ✅ Complete | P2 | Page title component (12 tests) |
| EmptyState.vue | EmptyState.tsx | ✅ Complete | P2 | Empty state display (12 tests) |
| LoadingSpinner.vue | LoadingSpinner.tsx | ✅ Complete | P2 | Loading spinner (13 tests) |
| Section.vue | Section.tsx | ✅ Complete | P2 | Section wrapper (12 tests) |
| StatusBadge.vue | StatusBadge.tsx | ✅ Complete | P2 | Status badge (14 tests) |
| SectionDivider.vue | SectionDivider.tsx | ✅ Complete | P2 | Section divider (12 tests) |
| AlertMessage.vue | AlertMessage.tsx | ✅ Complete | P2 | Alert message (15 tests) |
| TooltipWrapper.vue | TooltipWrapper.tsx | ✅ Complete | P2 | Tooltip wrapper (12 tests) |
| TagLabel.vue | TagLabel.tsx | ✅ Complete | P2 | Tag label (15 tests) |
| ProgressBar.vue | ProgressBar.tsx | ✅ Complete | P2 | Progress bar (14 tests) |
| DividerLine.vue | DividerLine.tsx | ✅ Complete | P2 | Divider line (11 tests) |
| CardWrapper.vue | CardWrapper.tsx | ✅ Complete | P2 | Card wrapper (12 tests) |
| SpinLoader.vue | SpinLoader.tsx | ✅ Complete | P2 | Spin loader (12 tests) |
| InputField.vue | InputField.tsx | ✅ Complete | P2 | Input field (10 tests) |
| SelectField.vue | SelectField.tsx | ✅ Complete | P2 | Select field (11 tests) |
| ButtonComponent.vue | ButtonComponent.tsx | ✅ Complete | P2 | Button component (12 tests) |
| CheckboxField.vue | CheckboxField.tsx | ✅ Complete | P2 | Checkbox field (11 tests) |
| RadioField.vue | RadioField.tsx | ✅ Complete | P2 | Radio field (10 tests) |
| SwitchField.vue | SwitchField.tsx | ✅ Complete | P2 | Switch field (12 tests) |
| TextAreaField.vue | TextAreaField.tsx | ✅ Complete | P2 | TextArea field (12 tests) |
| ModalComponent.vue | ModalComponent.tsx | ✅ Complete | P2 | Modal component (13 tests) |
| DrawerComponent.vue | DrawerComponent.tsx | ✅ Complete | P2 | Drawer component (12 tests) |
| PopoverComponent.vue | PopoverComponent.tsx | ✅ Complete | P2 | Popover component (11 tests) |
| TableComponent.vue | TableComponent.tsx | ✅ Complete | P2 | Table component (11 tests) |
| TabsComponent.vue | TabsComponent.tsx | ✅ Complete | P2 | Tabs component (12 tests) |
| CollapseComponent.vue | CollapseComponent.tsx | ✅ Complete | P2 | Collapse component (10 tests) |
| FormComponent.vue | FormComponent.tsx | ✅ Complete | P2 | Form component (11 tests) |
| SpaceComponent.vue | SpaceComponent.tsx | ✅ Complete | P2 | Space component (10 tests) |
| RowComponent.vue | RowComponent.tsx | ✅ Complete | P2 | Row component (9 tests) |
| ColComponent.vue | ColComponent.tsx | ✅ Complete | P2 | Col component (9 tests) |
| DividerComponent.vue | DividerComponent.tsx | ✅ Complete | P2 | Divider component (10 tests) |
| CardComponent.vue | CardComponent.tsx | ✅ Complete | P2 | Card component (11 tests) |
| ListComponent.vue | ListComponent.tsx | ✅ Complete | P2 | List component (11 tests) |
| CheckboxComponent.vue | CheckboxComponent.tsx | ✅ Complete | P2 | Checkbox component (10 tests) |
| ConfigEditorReportsStreamGrid.vue | ConfigEditorStreamGrid.tsx | ✅ Complete | P2 | Config editor grid (14 tests) |

---

## Migration Strategy

### Phase 1: Core Infrastructure (Week 1-2)
**Target**: 15 components (P0 priority)

1. ✅ Button (COMPLETED)
2. Templates: BaseLayout, LoginLayout
3. AppLogo
4. Login components (2)
5. Navigation components (4)
6. Data Tables (2)
7. LogOutButton
8. Basic utilities (3)

### Phase 2: High-Priority Shared Components (Week 3-4)
**Target**: 30 components (P1 priority)

1. Error handling (4)
2. Adaptable Blotter (18)
3. State Machine core (11)
4. Filter Builder (5)
5. Transfer components (2)
6. DateTimePicker, SelectBoolean

### Phase 3: Specialized Components (Week 5-6)
**Target**: 49 components (P2-P3 priority)

1. AI ChatBot (11)
2. Export/Import (5)
3. Data Lineage (4)
4. State Machine Consistency (4)
5. Cyoda Modelling (8)
6. Remaining utilities (17)

---

## Next Immediate Steps

1. ✅ Setup testing infrastructure (Vitest + React Testing Library) - COMPLETE
2. ✅ Migrate P0 templates (BaseLayout, LoginLayout, AppLogo) - COMPLETE (3/3)
3. ✅ Migrate P0 Login components (Login, LoginAuth0Btn) - COMPLETE (2/2)
4. ✅ Migrate P0 Navigation components (Home, Breadcrumbs, HomeDrawer, HomeMenuDisplay) - COMPLETE (4/4)
5. ✅ Migrate P0 Data Tables (CyodaDataTables, CyodaDataTablesDraggable) - COMPLETE (2/2)
6. ✅ Migrate P0 utilities (LogOutButton) - COMPLETE (1/1)
7. 🎉 **ALL P0 COMPONENTS COMPLETE!** (13/13 - 100%)
8. 🟡 Begin P1 component migration - NEXT
9. Create shared hooks for common patterns

---

**Last Updated**: 2025-10-08

