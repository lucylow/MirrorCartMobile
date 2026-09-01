# Project TODO

- [x] Review hackathon brief and MirrorCart manuscript
- [x] Initialize Expo React Native project with server, database, and user capabilities
- [x] Define mobile interface design for portrait, one-handed use
- [x] Generate and install a unique MirrorCart app logo and update app.config.ts branding
- [x] Replace starter theme with MirrorCart editorial palette
- [x] Build Home prompt and occasion-led entry flow
- [x] Build AR-oriented camera/photo capture with full-body framing guidance
- [x] Add Looks, Look Detail, Cart, and Profile navigation destinations
- [x] Define shared product, look, intent, refinement, and orchestration state types
- [x] Add backend tables or persistence model for styling sessions, products, looks, and cart state
- [x] Add typed tRPC endpoints for intent parsing, product search, look composition, budget validation, try-on jobs, refinement, save, and cart preparation
- [x] Implement provider-safe VTO adapter boundary with Perfect Corp integration seam and deterministic mock adapter for local development
- [x] Keep provider credentials and image processing server-side
- [x] Connect the mobile flow to backend state and display progress events
- [x] Add refinement loop that preserves owned items and rechecks budget
- [x] Add AI visualization disclosure and Perfect Corp attribution
- [x] Add deterministic tests for schemas, budget calculation, orchestration states, and refinement behavior
- [x] Run typecheck, lint, and tests
- [x] Capture preview screenshots and save final checkpoint

- [x] Improve backend state persistence and refinement visibility
- [x] Add focused tests for budget validation, owned-item preservation, and cart totals
- [x] Revalidate the improved mobile flow and save a new checkpoint

- [x] Add durable persistence for styling sessions, looks, and carts
- [x] Add session retrieval and status APIs for recovery after navigation
- [x] Improve orchestration progress events and recoverable error responses
- [x] Expand tests for session storage, API state transitions, and failure paths
- [x] Revalidate the improved flow and save a new checkpoint

- [x] Harden Perfect Corp provider configuration, request validation, and task lifecycle contracts
- [x] Add live styling-session progress polling to the mobile Looks flow
- [x] Add retry and missing-session recovery UI
- [x] Expand provider and persistence failure-path tests
- [x] Revalidate the improved flow and save a new checkpoint

- [x] Persist VTO task identifiers, provider status, and result URLs in styling sessions
- [x] Add provider-failure and expired-result recovery behavior
- [x] Improve Try On loading, error, retry, and completed-result UI
- [x] Add tests for VTO result persistence and failure recovery
- [x] Revalidate the Try On flow and save a new checkpoint

- [x] Review MirrorCart_100_Page_AR_Code_Manuscript against the current implementation
- [x] Reconcile AR domain fields and durable VTO persistence with the manuscript
- [x] Improve provider lifecycle, result persistence, and mobile AR recovery states
- [x] Add manuscript-driven AR flow and provider tests
- [x] Revalidate the integrated AR flow and save a new checkpoint

- [x] Review MirrorCart_100_Page_Agentic_Commerce_Code_Manuscript against current commerce code
- [x] Add safe product discovery and merchant provenance fields
- [x] Add human approval and no-autopurchase safeguards to cart preparation
- [x] Improve cart review, quantities, and merchant-link handling
- [x] Add agentic-commerce contract and safety tests
- [x] Revalidate commerce flow and save a new checkpoint

- [x] Review MirrorCart_100_Page_YouCam_API_React_Native_Code_Manuscript against current implementation
- [x] Reconcile YouCam API upload and task lifecycle contracts
- [x] Harden camera photo validation and backend upload handoff
- [x] Improve mobile try-on loading, provider errors, and retry states
- [x] Add YouCam contract tests and revalidate the full flow

- [x] Add durable saved-session and draft-cart recovery queries
- [x] Add merchant deep-link and product provenance actions
- [x] Add draft-cart quantity editing and server-side subtotal recalculation
- [x] Improve missing-session and empty-cart mobile recovery states
- [x] Add recovery and cart mutation tests
- [x] Revalidate the core journey and save a new checkpoint

- [x] Add durable recent styling-session history query
- [x] Add product availability and unavailable-item fallback handling
- [x] Connect Profile to resumable saved looks
- [x] Add session recovery and availability tests
- [x] Revalidate the recovery flow and save a new checkpoint

- [x] Add saved-look thumbnails and archive controls to Profile
- [x] Add unavailable-product replacement suggestions
- [x] Persist and restore completed VTO preview state in session recovery
- [x] Add tests for archive, fallback, and persisted preview behavior
- [x] Revalidate the experience and save a new checkpoint

- [x] Add archive confirmation before hiding saved looks
- [x] Add in-cart replacement suggestions for unavailable products
- [x] Improve persisted VTO preview presentation and fallback copy
- [x] Add tests for archive confirmation and replacement selection
- [x] Revalidate the flow and save a new checkpoint

- [x] Add explicit availability badges and unavailability reasons to Cart items
- [x] Add saved-look resume metadata and clearer recovery copy
- [x] Improve live VTO result handoff into Look Detail and Profile
- [x] Add tests for availability and VTO handoff state
- [x] Revalidate the journey and save a new checkpoint

- [x] Add inventory-aware availability refresh and merchant fallback states
- [x] Add archive undo and archived-edits recovery
- [x] Tighten YouCam result persistence and Look Detail handoff
- [x] Add tests for inventory refresh, undo, and VTO result recovery
- [x] Revalidate the journey and save a new checkpoint

- [ ] Configure required YouCam and merchant inventory connector secrets safely
- [ ] Persist completed YouCam preview URLs into Look Detail sessions
- [ ] Add archived-edits list with restore and permanent-delete safeguards
- [ ] Add live merchant inventory refresh and cart availability updates
- [ ] Add integration and failure-path tests
- [ ] Revalidate all requested flows and save a new checkpoint

- [ ] Harden mock VTO task lifecycle and deterministic preview fallback
- [ ] Add archived-edits recovery entry point without live credentials
- [ ] Improve AR-to-cart empty, retry, and approval states
- [ ] Add offline-mode tests for recovery and mock VTO behavior
- [ ] Revalidate the offline-safe journey and save a new checkpoint

- [x] Diagnose the current reported TypeScript or server errors
- [x] Apply targeted fixes and preserve existing behavior
- [x] Re-run typecheck, lint, tests, and preview validation
- [x] Save a repaired checkpoint

- [x] Review MirrorCart_100_Page_Less_Mock_Data_React_Native_Code_Manuscript against current catalog and screens
- [x] Add realistic catalog provenance and data-quality metadata
- [x] Replace hardcoded assumptions with typed configurable catalog data
- [x] Preserve clear offline fallback states when live sources are unavailable
- [x] Add data-quality tests and save a new checkpoint

- [x] Add typed catalog hydration with cache and demo fallback modes
- [x] Add product freshness metadata and pre-cart validation contracts
- [x] Add product-detail freshness/recovery surface
- [x] Add tests for hydration fallback and stale product blocking
- [x] Revalidate the journey and save a new checkpoint

- [x] Add product-detail freshness and retry surface
- [x] Add server-side pre-cart stale-price and availability validation
- [x] Improve offline recovery copy and blocked approval states
- [x] Add freshness and pre-cart validation tests
- [x] Revalidate the journey and save a new checkpoint

- [x] Add product-detail freshness and retry route
- [x] Add approval-time validation messaging and blocked-state recovery
- [x] Improve offline recovery copy for missing or stale product data
- [x] Add tests for product detail and approval validation
- [x] Revalidate the flow and save a new checkpoint

- [x] Inspect the GitHub MirrorCartMobileAppMockup repository and identify all design assets/screens
- [x] Extract mockup typography, spacing, colors, components, and interaction patterns
- [x] Map the mockup screens to existing MirrorCart routes without breaking backend flows
- [x] Integrate detailed visual styling and mockup assets into the Expo app
- [x] Validate visual fidelity, accessibility, and existing AR/commerce behavior
- [x] Save a design integration checkpoint

- [x] Reinspect the GitHub mockup against the current design checkpoint
- [x] Audit remaining Looks, Try On, Look Detail, Cart, Profile, and recovery-state visual gaps
- [x] Refine remaining screens and interaction states to match the Figma mobile design
- [x] Validate the refined journey, accessibility, and regression behavior
- [x] Save the refined design checkpoint

- [x] Audit the latest checkpoint against the full mockup screen inventory
- [x] Compare uncovered onboarding, discovery, look-builder, wardrobe, saved, chat, notification, and settings patterns
- [x] Implement remaining high-value visual and interaction details
- [x] Run end-to-end visual and regression validation
- [x] Save the expanded design checkpoint

- [x] Reinspect the reference repository and latest design-parity checkpoint
- [x] Identify remaining visual and interaction parity gaps across the full mobile journey
- [x] Implement the next native design refinements
- [x] Validate routes, interactions, and regression behavior
- [x] Save the new design-parity checkpoint

- [x] Audit current code, logs, tests, and worklist for the next improvement pass
- [x] Prioritize safe high-value improvements in the core styling and commerce journey
- [x] Implement the selected code and UX improvements
- [x] Validate regressions and key routes
- [x] Save an improvement checkpoint

- [x] Audit current implementation and pending reliability work
- [x] Choose the next safe reliability improvements
- [x] Implement and test the improvements
- [x] Validate the key journey and mobile surfaces
- [x] Save the reliability checkpoint

- [x] Audit recovery, VTO, and cart code paths
- [x] Select safe improvements and edge cases
- [x] Implement recovery and commerce refinements
- [x] Run regression and mobile-route validation
- [ ] Save the improvement checkpoint

- [x] Audit durable recovery and cart edge cases
- [x] Select safe improvements and regression risks
- [x] Implement resilience improvements and tests
- [x] Validate core routes and behavior
- [x] Save the resilience checkpoint

- [x] Audit session, cart, and test boundaries
- [x] Select the next safe maintainability improvements
- [x] Implement consistency fixes and tests
- [x] Validate key routes and regression behavior
- [x] Save the maintainability checkpoint

- [x] Harden draft-cart mutation preconditions and approval status transitions
- [x] Add regression coverage for cart membership and approval warnings
- [x] Validate the core cart, VTO recovery, Looks, and Profile routes
- [ ] Save the latest maintainability checkpoint

- [x] Audit offline recovery and cart feedback
- [x] Select safe UX and reliability improvements
- [x] Implement feedback and recovery refinements
- [x] Validate core routes and regressions
- [ ] Save the feedback checkpoint

- [x] Audit persisted session and VTO lifecycle paths
- [x] Select safe lifecycle and recovery improvements
- [x] Implement lifecycle hardening and tests
- [x] Validate recovery routes and regressions
- [ ] Save the lifecycle checkpoint

- [x] Audit persisted session and approval recovery paths
- [x] Select safe robustness improvements
- [x] Implement recovery hardening and tests
- [x] Validate the core journey and regressions
- [ ] Save the robustness checkpoint

- [x] Audit persistence helpers and recovery boundaries
- [x] Select safe persistence improvements and tests
- [x] Implement persistence coverage and recovery hardening
- [x] Validate regressions and mobile recovery surfaces
- [ ] Save the persistence checkpoint

- [ ] Audit current code and pending safety gaps
- [ ] Prioritize the next low-risk improvements
- [ ] Implement improvements and deterministic tests
- [ ] Validate routes and regression behavior
- [ ] Save the quality checkpoint

- [x] Harden Cart deep-link parsing and invalid navigation recovery
- [x] Clarify disabled approval state when draft validation fails
- [x] Validate the updated core routes and regression suite
- [ ] Save the latest quality checkpoint

- [x] Audit current code and pending safety gaps
- [x] Prioritize the next low-risk improvements
- [x] Implement improvements and deterministic tests
- [x] Validate routes and regression behavior
- [ ] Save the quality checkpoint

- [ ] Audit current recovery and commerce code
- [ ] Prioritize low-risk improvements and regression cases
- [ ] Implement changes and deterministic tests
- [ ] Validate routes and regression behavior
- [ ] Save the reliability checkpoint

- [x] Make durable session and cart writes tolerant of transient database outages
- [x] Preserve in-memory recovery during offline persistence failures
- [x] Validate the updated core routes and regression suite
- [ ] Save the latest offline-resilience checkpoint

- [ ] Audit current failure paths and test seams
- [ ] Prioritize low-risk coverage and UX improvements
- [ ] Implement failure-path hardening and tests
- [ ] Validate recovery routes and regressions
- [ ] Save the failure-path checkpoint

- [x] Harden cached cart lookup by cart ID and look ID
- [x] Add deterministic regression coverage for both identifiers
- [x] Validate Cart, Looks, Try On, and Profile mobile surfaces
- [ ] Save the latest recovery checkpoint

- [x] Audit current failure paths and test seams
- [x] Prioritize low-risk coverage and UX improvements
- [x] Implement failure-path hardening and tests
- [x] Validate recovery routes and regressions
- [x] Harden cart lookup across cart IDs and look IDs
- [x] Preserve in-memory recovery during transient persistence failures
- [ ] Save the failure-path checkpoint

- [x] Audit current failure handling and test seams
- [x] Prioritize safe improvements and regression cases
- [x] Implement hardening and deterministic tests
- [x] Validate the core journey and recovery surfaces
- [ ] Save the failure-handling checkpoint

- [x] Add shared safe user-facing error normalization
- [x] Apply normalized recovery copy to Cart and Try On
- [x] Validate core routes and regression behavior
- [ ] Save the failure-handling checkpoint

- [ ] Audit persistence state and UI seams
- [ ] Choose a safe offline-state improvement
- [ ] Implement persistence feedback and tests
- [ ] Validate mobile surfaces and regressions
- [ ] Save the offline-state checkpoint

- [x] Audit current failure handling and test seams
- [x] Prioritize safe improvements and regression cases
- [x] Implement hardening and deterministic tests
- [x] Validate the core journey and recovery surfaces
- [x] Add deterministic coverage for safe and technical error messages
- [x] Validate Home, Cart, Try On, and Profile routes
- [ ] Save the failure-handling checkpoint

- [ ] Audit current code and test seams
- [ ] Prioritize the next safe improvement
- [ ] Implement and test the reliability change
- [ ] Validate the mobile journey and regressions
- [ ] Save the reliability checkpoint

- [x] Audit current code and test seams
- [x] Prioritize the next safe improvement
- [x] Remove the remaining deprecated pointer-events declaration
- [x] Expand deterministic error-policy coverage
- [x] Validate the mobile journey and regressions
- [ ] Save the latest quality checkpoint

- [ ] Audit current code and test seams
- [ ] Select the next safe reliability improvement
- [ ] Implement and test the improvement
- [ ] Validate the mobile journey and regressions
- [ ] Save the reliability checkpoint

- [x] Audit current code and test seams
- [x] Prioritize the next safe reliability improvement
- [x] Cap actionable error copy at a mobile-safe length
- [x] Add deterministic coverage for long error messages
- [x] Validate the mobile journey and regressions
- [ ] Save the reliability checkpoint

- [ ] Audit persistence failure seams and recovery UI
- [ ] Prioritize safe testable improvements
- [ ] Implement persistence coverage and recovery copy
- [ ] Validate mobile routes and regression behavior
- [ ] Save the persistence-coverage checkpoint

- [x] Audit current failure handling and test seams
- [x] Prioritize low-risk coverage and UX improvements
- [x] Implement approval-token expiry cleanup and deterministic tests
- [x] Validate Cart, Try On, Home, and Profile routes
- [ ] Save the latest lifecycle checkpoint

- [x] Audit current code and deterministic test seams
- [x] Prioritize a low-risk improvement
- [x] Implement the improvement and tests
- [x] Validate the mobile journey and regressions
- [ ] Save the improvement checkpoint

- [x] Audit the offline banner’s test seams
- [x] Extract a pure offline-state policy
- [x] Add deterministic transition coverage
- [x] Validate routes and regression behavior
- [x] Save the checkpoint and report

- [x] Audit archive and saved-look recovery seams
- [x] Define restore and delete safety rules
- [x] Implement guarded archive recovery behavior
- [x] Add deterministic tests and validate routes
- [ ] Save the archive-safety checkpoint

- [x] Audit Profile navigation and archived-session data access
- [x] Design the archived-edits recovery interaction
- [x] Implement archived list, restore, and deletion confirmation
- [x] Add deterministic safeguards and validate mobile routes
- [ ] Save the archive-recovery checkpoint

- [x] Audit current archive deletion and test boundaries
- [x] Define a deliberate permanent-delete confirmation contract
- [x] Implement confirmation and archive-flow coverage
- [x] Validate routes, tests, and recovery behavior
- [ ] Save the delete-safety checkpoint

- [ ] Audit archive-flow integration seams
- [ ] Define archive lifecycle regression cases
- [ ] Implement integration-quality test coverage
- [ ] Validate mobile recovery surfaces
- [ ] Save the archive-integration checkpoint

- [x] Audit archive-flow integration seams
- [x] Define archive lifecycle regression cases
- [x] Implement integration-quality test coverage
- [x] Validate mobile recovery surfaces
- [ ] Save the archive-integration checkpoint

- [ ] Audit archived-screen feedback seams
- [ ] Define recovery feedback states
- [ ] Implement success and pending feedback
- [ ] Validate mobile routes and regressions
- [ ] Save the recovery-feedback checkpoint

- [x] Audit archived-screen feedback seams
- [x] Define recovery feedback states
- [x] Implement success and pending feedback
- [x] Validate mobile routes and regressions
- [ ] Save the recovery-feedback checkpoint

- [ ] Audit archived query loading and retry seams
- [ ] Define loading and retry recovery states
- [ ] Implement resilient archived-session feedback
- [ ] Validate mobile routes and regressions
- [ ] Save the archived-query checkpoint

- [x] Audit archived query loading and retry seams
- [x] Define loading and retry recovery states
- [x] Implement resilient archived-session feedback
- [x] Validate mobile routes and regressions
- [ ] Save the archived-query checkpoint

- [ ] Audit archived data caching and persistence seams
- [ ] Define safe cache freshness and fallback behavior
- [ ] Implement cached archived-session recovery
- [ ] Add deterministic coverage and validate mobile routes
- [ ] Save the cached-recovery checkpoint

- [x] Audit archived data caching and persistence seams
- [x] Define safe cache freshness and fallback behavior
- [x] Implement cached archived-session recovery
- [x] Add deterministic coverage and validate mobile routes
- [ ] Save the cached-recovery checkpoint

- [x] Audit archived data caching and persistence seams
- [x] Define safe cache freshness and fallback behavior
- [x] Implement cached archived-session recovery
- [x] Add deterministic coverage and validate mobile routes
- [ ] Save the cached-recovery checkpoint

- [ ] Audit local archive cache lifecycle
- [ ] Define cache expiry and cleanup policy
- [ ] Implement freshness metadata and pruning
- [ ] Add deterministic coverage and validate mobile routes
- [ ] Save the cache-freshness checkpoint

- [x] Audit local archive cache lifecycle
- [x] Define cache expiry and cleanup policy
- [x] Implement freshness metadata and pruning
- [x] Add deterministic coverage and validate mobile routes
- [ ] Save the cache-freshness checkpoint

- [ ] Audit local cache ownership and cleanup seams
- [ ] Define clear local-only cleanup semantics
- [ ] Implement guarded cache clearing feedback
- [ ] Add deterministic coverage and validate mobile routes
- [ ] Save the cache-cleanup checkpoint

- [x] Audit local cache ownership and cleanup seams
- [x] Define clear local-only cleanup semantics
- [x] Implement guarded cache clearing feedback
- [x] Add deterministic coverage and validate mobile routes
- [ ] Save the cache-cleanup checkpoint

- [ ] Audit cache metadata and archived-screen display seams
- [ ] Define accurate last-synced semantics
- [ ] Implement cache timestamp display
- [ ] Add deterministic metadata coverage and validate mobile routes
- [ ] Save the last-synced checkpoint

- [x] Audit cache metadata and archived-screen display seams
- [x] Define accurate last-synced semantics
- [x] Implement cache timestamp display
- [x] Add deterministic metadata coverage and validate mobile routes
- [ ] Save the last-synced checkpoint

- [ ] Audit timestamp display and formatting seams
- [ ] Define deterministic relative-time semantics
- [ ] Implement relative freshness copy
- [ ] Add deterministic formatting coverage and validate mobile routes
- [ ] Save the relative-time checkpoint

- [x] Audit timestamp display and formatting seams
- [x] Define deterministic relative-time semantics
- [x] Implement relative freshness copy
- [x] Add deterministic formatting coverage and validate mobile routes
- [ ] Save the relative-time checkpoint

- [ ] Audit archive refresh and query state seams
- [ ] Define explicit refresh feedback states
- [ ] Implement manual archive refresh behavior
- [ ] Add deterministic coverage and validate mobile routes
- [ ] Save the manual-refresh checkpoint

- [x] Audit archive refresh and query state seams
- [x] Define explicit refresh feedback states
- [x] Implement manual archive refresh behavior
- [x] Add deterministic coverage and validate mobile routes
- [ ] Save the manual-refresh checkpoint

- [ ] Audit archived list refresh seams
- [ ] Define native pull-to-refresh behavior
- [ ] Implement list refresh interaction
- [ ] Validate mobile routes and regressions
- [ ] Save the pull-to-refresh checkpoint

- [x] Audit archived list refresh seams
- [x] Define native pull-to-refresh behavior
- [x] Implement list refresh interaction
- [x] Validate mobile routes and regressions
- [ ] Save the pull-to-refresh checkpoint

- [ ] Audit refresh completion and haptics seams
- [ ] Define platform-safe success feedback
- [ ] Implement refresh completion feedback
- [ ] Add deterministic coverage and validate mobile routes
- [ ] Save the refresh-feedback checkpoint

- [x] Audit refresh completion and haptics seams
- [x] Define platform-safe success feedback
- [x] Implement refresh completion feedback
- [x] Add deterministic coverage and validate mobile routes
- [ ] Save the refresh-feedback checkpoint

- [ ] Trace the remaining preview warning
- [ ] Define a compatible pointer-events replacement
- [ ] Implement the warning cleanup
- [ ] Validate tests and mobile surfaces
- [ ] Save the warning-cleanup checkpoint

- [x] Trace the remaining preview warning
- [x] Define a compatible pointer-events replacement
- [x] Implement the warning cleanup
- [x] Validate tests and mobile surfaces
- [ ] Save the warning-cleanup checkpoint

- [ ] Audit offline banner test seams
- [ ] Define pure banner presentation states
- [ ] Implement and test offline presentation policy
- [ ] Validate mobile routes and regressions
- [ ] Save the offline-banner checkpoint

- [x] Audit offline banner test seams
- [x] Define pure banner presentation states
- [x] Implement and test offline presentation policy
- [x] Validate mobile routes and regressions
- [ ] Save the offline-banner checkpoint

- [ ] Audit network transition and root-shell seams
- [ ] Define conservative reconnect presentation states
- [ ] Implement reconnect feedback without false positives
- [ ] Add deterministic transition coverage and validate mobile routes
- [ ] Save the reconnect-signal checkpoint

- [x] Audit network transition and root-shell seams
- [x] Define conservative reconnect presentation states
- [x] Implement reconnect feedback without false positives
- [x] Add deterministic transition coverage and validate mobile routes
- [ ] Save the reconnect-signal checkpoint

- [ ] Audit reconnect banner and refresh integration seams
- [ ] Define a safe reconnect action contract
- [ ] Implement reconnect refresh affordance
- [ ] Add deterministic transition coverage and validate mobile routes
- [ ] Save the reconnect-action checkpoint

- [x] Audit reconnect banner and refresh integration seams
- [x] Define a safe reconnect action contract
- [x] Implement reconnect refresh affordance
- [x] Add deterministic transition coverage and validate mobile routes
- [ ] Save the reconnect-action checkpoint

- [ ] Audit reconnect banner and refresh integration seams
- [ ] Define a safe reconnect refresh contract
- [ ] Implement reconnect-triggered refresh behavior
- [ ] Add deterministic transition coverage and validate mobile routes
- [ ] Save the reconnect-refresh checkpoint

- [x] Audit reconnect banner and refresh integration seams
- [x] Define a safe reconnect refresh contract
- [x] Implement reconnect-triggered refresh behavior
- [x] Add deterministic transition coverage and validate mobile routes
- [ ] Save the reconnect-refresh checkpoint

- [ ] Audit catalog query and reconnect integration seams
- [ ] Define safe reconnect catalog refresh semantics
- [ ] Implement catalog refresh routing and feedback
- [ ] Add deterministic coverage and validate mobile routes
- [ ] Save the catalog-refresh checkpoint

- [x] Audit catalog query and reconnect integration seams
- [x] Define safe reconnect catalog refresh semantics
- [x] Implement catalog refresh routing and feedback
- [x] Add deterministic coverage and validate mobile routes
- [ ] Save the catalog-refresh checkpoint

- [ ] Audit catalog surface refresh indicators
- [ ] Define a reusable refresh-status presentation
- [ ] Implement visible reconnect refresh feedback
- [ ] Add deterministic coverage and validate mobile routes
- [ ] Save the catalog-refresh-indicator checkpoint

- [x] Audit catalog surface refresh indicators
- [x] Define a reusable refresh-status presentation
- [x] Implement visible reconnect refresh feedback
- [x] Add deterministic coverage and validate mobile routes
- [ ] Save the catalog-refresh-indicator checkpoint

- [ ] Audit reconnect refresh lifecycle and visible status
- [ ] Define refreshing and refreshed presentation states
- [ ] Implement accurate reconnect refresh feedback
- [ ] Add deterministic coverage and validate mobile routes
- [ ] Save the reconnect-status checkpoint

- [x] Audit reconnect refresh lifecycle and visible status
- [x] Define refreshing and refreshed presentation states
- [x] Implement accurate reconnect refresh feedback
- [x] Add deterministic coverage and validate mobile routes
- [ ] Save the reconnect-status checkpoint

- [ ] Audit catalog browsing surface and refresh ownership
- [ ] Define a reusable catalog refresh status contract
- [ ] Implement catalog refresh indicator
- [ ] Add deterministic coverage and validate mobile routes
- [ ] Save the catalog-indicator checkpoint

- [x] Audit catalog browsing surface and refresh ownership
- [x] Define a reusable catalog refresh status contract
- [x] Implement catalog refresh indicator
- [x] Add deterministic coverage and validate mobile routes
- [ ] Save the catalog-indicator checkpoint

- [ ] Audit cart inventory query and refresh seams
- [ ] Define cart availability refresh-status behavior
- [ ] Implement inventory refresh visibility
- [ ] Add deterministic coverage and validate mobile routes
- [ ] Save the inventory-refresh checkpoint

- [x] Audit cart inventory query and refresh seams
- [x] Define cart availability refresh-status behavior
- [x] Implement inventory refresh visibility
- [x] Add deterministic coverage and validate mobile routes
- [ ] Save the inventory-refresh checkpoint

- [ ] Audit Cart product metadata and availability display seams
- [ ] Define trustworthy item freshness semantics
- [ ] Implement Cart availability freshness copy
- [ ] Add deterministic coverage and validate mobile routes
- [ ] Save the item-freshness checkpoint

- [x] Audit Cart product metadata and availability display seams
- [x] Define trustworthy item freshness semantics
- [x] Implement Cart availability freshness copy
- [x] Add deterministic coverage and validate mobile routes
- [ ] Save the item-freshness checkpoint

- [ ] Audit Cart freshness copy and accessibility seams
- [ ] Define pure item-freshness presentation semantics
- [ ] Implement accessible freshness presentation
- [ ] Add deterministic coverage and validate mobile routes
- [ ] Save the item-freshness-coverage checkpoint

- [x] Audit Cart freshness copy and accessibility seams
- [x] Define pure item-freshness presentation semantics
- [x] Implement accessible freshness presentation
- [x] Add deterministic coverage and validate mobile routes
- [ ] Save the item-freshness-coverage checkpoint

- [x] Audit product availability provenance and Cart copy
- [x] Define source-aware availability semantics
- [x] Implement source-aware Cart presentation
- [x] Add deterministic coverage and validate mobile routes
- [ ] Save the provenance checkpoint

- [x] Audit approval expiry state after successful approval
- [x] Clear consumed approval expiry metadata on approved carts
- [x] Add approval lifecycle regression coverage
- [x] Validate Cart and commerce regressions
- [ ] Save the approval-state checkpoint

- [x] Audit approval expiry handling across server and Cart
- [x] Define safe expiry recovery semantics
- [x] Implement expiry recovery and coverage
- [x] Validate Cart and recovery routes
- [ ] Save the approval-expiry checkpoint

- [x] Audit approval-window timing across server and Cart
- [x] Define deterministic approval-window copy
- [x] Implement active countdown semantics and coverage
- [x] Validate Cart and recovery routes
- [ ] Save the approval-window checkpoint

- [x] Audit approval countdown state and hook constraints
- [x] Define timer-safe countdown behavior
- [x] Implement live countdown and regression coverage
- [x] Validate Cart and recovery routes
- [ ] Save the live-countdown checkpoint

- [x] Audit countdown timer and expiry transitions
- [x] Define timer-safe update cadence and boundary behavior
- [x] Implement countdown hardening and regression coverage
- [x] Validate Cart and recovery routes
- [ ] Save the countdown-hardening checkpoint

- [x] Audit Cart approval state derivation
- [x] Define stable approval-state semantics
- [x] Implement state helper and regression coverage
- [x] Validate Cart and recovery routes
- [ ] Save the approval-state-quality checkpoint

- [x] Audit persisted approval recovery boundaries
- [x] Define safe resumed-approval semantics
- [x] Implement resumed approval recovery and coverage
- [x] Validate Cart and recovery routes
- [ ] Save the resumed-approval checkpoint

- [x] Audit approval lifecycle seams and testability
- [x] Define deterministic lifecycle scenarios
- [x] Implement lifecycle coverage and safe seams
- [x] Validate Cart and approval routes
- [ ] Save the lifecycle-coverage checkpoint

- [x] Review monetization manuscript and current monetization seams
- [x] Select a user-safe monetization improvement
- [x] Implement the improvement and regression coverage
- [x] Validate monetization and core mobile routes
- [ ] Save the monetization checkpoint

- [x] Audit entitlement policy and reusable UI seams
- [x] Define feature-gate contract and fallback behavior
- [x] Implement reusable gate and regression coverage
- [x] Validate core mobile routes and gate compilation
- [ ] Save the feature-gate checkpoint

- [x] Review ecommerce personalization manuscript and current seams
- [x] Select a safe personalization improvement
- [x] Implement the improvement and regression coverage
- [x] Validate personalization and core mobile routes
- [ ] Save the personalization checkpoint

- [x] Audit current look ranking and wardrobe signal seams
- [x] Define deterministic wardrobe-aware ranking semantics
- [x] Implement ranking seam and regression coverage
- [x] Validate recommendation and core mobile routes
- [ ] Save the wardrobe-ranking checkpoint

- [x] Audit look-card presentation and rationale data flow
- [x] Define concise transparent wardrobe rationale copy
- [x] Implement rationale presentation and regression coverage
- [x] Validate recommendation and core mobile routes
- [ ] Save the wardrobe-rationale checkpoint

- [x] Audit Look Detail and Cart data flow
- [x] Define consistent rationale presentation across commerce surfaces
- [x] Implement rationale cards and regression coverage
- [x] Validate Look Detail, Cart, and core mobile routes
- [ ] Save the rationale-propagation checkpoint

- [x] Audit wardrobe context normalization and fallback seams
- [x] Define defensive personalization semantics
- [x] Implement normalization and regression coverage
- [x] Validate personalization and core mobile routes
- [ ] Save the personalization-fallback checkpoint

- [x] Audit existing wardrobe signals and Profile seams
- [x] Define local wardrobe model and safe persistence contract
- [x] Implement wardrobe model and deterministic coverage
- [x] Validate Profile, Looks, Cart, and offline-safe behavior
- [ ] Save the local-wardrobe checkpoint

- [x] Audit My Wardrobe interaction and storage seams
- [x] Define accessible add-piece interaction and validation
- [x] Implement local add-piece flow and coverage
- [x] Validate My Wardrobe and core mobile routes
- [ ] Save the add-piece checkpoint

- [x] Audit wardrobe persistence lifecycle and feedback seams
- [x] Define clear saved, saving, and unavailable states
- [x] Implement persistence feedback and regression coverage
- [x] Validate My Wardrobe and core mobile routes
- [ ] Save the persistence-feedback checkpoint

- [x] Audit local wardrobe and recommendation data flow
- [x] Define privacy-safe cross-screen wardrobe context
- [x] Implement local context bridge and regression coverage
- [x] Validate My Wardrobe, Looks, and Cart routes
- [ ] Save the local-context checkpoint

- [x] Audit local wardrobe hydration and request enrichment
- [x] Define deterministic context-loading semantics
- [x] Implement context loader and regression coverage
- [x] Validate Home, My Wardrobe, Looks, and Cart routes
- [ ] Save the context-loader checkpoint

- [x] Audit wardrobe freshness data flow
- [x] Define deterministic local freshness semantics
- [x] Implement freshness signal and regression coverage
- [x] Validate Home, My Wardrobe, Looks, and Cart routes
- [ ] Save the wardrobe-freshness checkpoint

- [x] Audit wardrobe write sequencing and state transitions
- [x] Define deterministic latest-write semantics
- [x] Implement write sequencing and regression coverage
- [x] Validate My Wardrobe, Home, and core mobile routes
- [ ] Save the race-safe-persistence checkpoint

- [x] Audit inferred and saved wardrobe merge behavior
- [x] Define durable local removal semantics
- [x] Implement removal tombstones and regression coverage
- [x] Validate My Wardrobe, Home, and core mobile routes
- [ ] Save the removal-tombstone checkpoint

- [x] Audit removed-piece filtering across local context flows
- [x] Define privacy-safe removal propagation semantics
- [x] Implement filtered context enrichment and regression coverage
- [x] Validate Home, My Wardrobe, Looks, and Cart routes
- [ ] Save the removal-propagation checkpoint

- [x] Audit wardrobe removal state and recovery entry points
- [x] Define local recovery interaction and copy
- [x] Implement removed-piece recovery with persistence
- [x] Add deterministic tests and validate key routes
- [ ] Save the wardrobe-recovery checkpoint

- [x] Audit current wardrobe recovery state transitions
- [x] Define undo feedback semantics for restore actions
- [x] Implement undo-style recovery feedback and tests
- [x] Validate wardrobe and core navigation surfaces
- [ ] Save the wardrobe-undo checkpoint

- [x] Audit repeated wardrobe action feedback and persistence transitions
- [x] Define stale-feedback clearing semantics
- [x] Implement action-aware feedback resets and regression coverage
- [x] Validate rapid-action states and core routes
- [ ] Save the wardrobe-feedback checkpoint

- [x] Audit Profile and session recovery surfaces
- [x] Define local snapshot storage and recovery semantics
- [x] Implement Saved Snapshots with durable local caching
- [x] Add deterministic coverage and validate recovery routes
- [ ] Save the saved-snapshots checkpoint

- [x] Audit Saved Snapshot ownership and mutation boundaries
- [x] Define deletion confirmation and cache consistency semantics
- [x] Implement local snapshot deletion with defensive persistence
- [x] Add deterministic coverage and validate Saved/Profile routes
- [ ] Save the snapshot-deletion checkpoint

- [x] Audit snapshot deletion and recovery state
- [x] Define local deletion recovery semantics
- [x] Implement snapshot restore and durable tombstone updates
- [x] Add deterministic coverage and validate Saved/Profile routes
- [ ] Save the snapshot-recovery checkpoint

- [x] Audit Saved Snapshot deletion feedback state
- [x] Define deletion confirmation and undo semantics
- [x] Implement undo feedback and durable restoration
- [x] Add deterministic coverage and validate core routes
- [ ] Save the snapshot-undo checkpoint

- [x] Audit current undo feedback lifecycle
- [x] Define timeout and latest-action semantics
- [x] Implement bounded undo state and tests
- [x] Validate deletion, recovery, and navigation routes
- [ ] Save the snapshot-undo-timeout checkpoint

- [x] Audit Saved Snapshot tombstone lifecycle
- [x] Define safe tombstone pruning semantics
- [x] Implement bounded tombstone persistence and tests
- [x] Validate Saved Snapshot recovery and core routes
- [ ] Save the snapshot-tombstone checkpoint

- [x] Audit local Saved Snapshot cache ownership
- [x] Define safe cache-clear confirmation semantics
- [x] Implement local cache cleanup and status feedback
- [x] Add deterministic coverage and validate Saved/Profile routes
- [ ] Save the snapshot-cache-clear checkpoint

- [x] Audit snapshot cache metadata and refresh boundaries
- [x] Define privacy-safe cache summary semantics
- [x] Implement refresh metadata and local summary UI
- [x] Add deterministic coverage and validate Saved/Profile routes
- [ ] Save the snapshot-cache-summary checkpoint

- [x] Audit merchant availability data flow and connector state
- [x] Define provider adapter, credential gating, and safety semantics
- [x] Implement server refresh procedure and shared availability types
- [x] Connect Cart refresh UI with demo fallback and approval guard
- [x] Add deterministic tests and validate live-refresh states
- [ ] Save the live-availability checkpoint

- [x] Audit current AR/VTO screens, provider adapter, and session persistence
- [x] Define retry, polling, and preview-recovery semantics
- [x] Implement robust VTO retry and persisted preview recovery
- [x] Polish AR UI feedback and retry actions
- [x] Add deterministic tests and validate AR routes
- [x] Save the AR-recovery checkpoint

- [x] Complete final AR/VTO retry and persisted-preview recovery hardening
- [x] Run final typecheck, lint, tests, and AR route validation
- [x] Save final AR/VTO checkpoint
- [ ] Package the validated project as a ZIP
