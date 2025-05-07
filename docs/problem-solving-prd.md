# Product Requirements Document (PRD)
# Gestructureerd Probleemoplossingsplan met MCP Tools

## 1. Inleiding

Dit document beschrijft een systematisch stappenplan voor het oplossen van problemen in softwareontwikkeling met behulp van Multi-Context Programming (MCP) tools. Het plan is specifiek ontworpen om een gestructureerde aanpak te bieden voor het identificeren, analyseren en oplossen van bugs, performance issues, en andere technische uitdagingen.

## 2. Doel en Scope

### 2.1 Doel
Het primaire doel van dit probleemoplossingsplan is om een methodische, reproduceerbare aanpak te bieden voor het diagnosticeren en oplossen van technische problemen. Door gebruik te maken van geavanceerde MCP tools, maximaliseert het plan de effectiviteit van AI debugging agents en zorgt het voor een consistente, grondige probleemoplossing.

### 2.2 Scope
Dit stappenplan is toepasbaar op alle soorten technische problemen binnen het project, van kleine UI bugs tot complexe performance bottlenecks en architecturale issues. Het proces schaalt mee met de complexiteit van het probleem, waarbij meer diagnostische stappen en tools worden ingezet naarmate de complexiteit toeneemt.

## 3. Probleemoplossing Fasen

Het probleemoplossingsplan bestaat uit vijf hoofdfasen, elk met specifieke stappen en bijbehorende MCP tools.

### 3.1 Fase 1: Probleem Identificatie en Reproductie

| Stap | Beschrijving | MCP Tools | Input | Output |
|------|-------------|-----------|-------|--------|
| 1.1 | **Probleem Rapportage Analyse** | Memory, Context7 | Bug reports, User feedback | Gestructureerde probleembeschrijving |
| 1.2 | **Reproductie Scenario Opstellen** | Sequential-Thinking, Puppeteer | Probleembeschrijving | Reproduceerbaar testscenario |
| 1.3 | **Omgevingsanalyse** | Desktop-Commander | Systeemconfiguratie | Omgevingsrapport |
| 1.4 | **Impact Classificatie** | TaskMaster-AI | Reproductiescenario, Omgevingsrapport | Prioriteit en impact assessment |

#### Gedetailleerde Tool Instructies voor Fase 1:

**Memory Instructies:**
```
Memory query --filter "related_to:[probleem_domein]" --sort "relevance" --limit 10
Memory store --key "problem.[probleem_id]" --value "[Probleem titel]" --content "[Gedetailleerde probleem analyse]"
```

**Sequential-Thinking Instructies:**
```
Sequential-Thinking decompose --process "Reproduceer [Bug Naam]" --steps_format "genummerd" --include_environment true
```

**Puppeteer Instructies:**
```
Puppeteer create_test --name "Reproduceer_[Bug_ID]" --steps "[Stappen om bug te reproduceren]" --record true
```

**Desktop-Commander Instructies:**
```
Desktop-Commander system_info --format "json" --save_path "./diagnostics/env_report.json"
Desktop-Commander check_dependencies --project "[Project Pad]" --report true
```

### 3.2 Fase 2: Root Cause Analyse

| Stap | Beschrijving | MCP Tools | Input | Output |
|------|-------------|-----------|-------|--------|
| 2.1 | **Code Tracing** | Desktop-Commander, GitHub | Reproductiescenario | Foutlocatie(s) |
| 2.2 | **Patroonherkenning** | Memory, Context7 | Foutlocatie(s), Historische bugs | Potentiële oorzaken |
| 2.3 | **Hypothese Formulering** | Sequential-Thinking | Potentiële oorzaken | Geteste hypotheses |
| 2.4 | **Diepgaande Diagnose** | Desktop-Commander, GitHub | Geteste hypotheses | Root cause(s) |

#### Gedetailleerde Tool Instructies voor Fase 2:

**Desktop-Commander Instructies:**
```
Desktop-Commander debug --script "[Reproductiescript]" --breakpoints "[Verdachte locaties]" --output "./diagnostics/debug_log.txt"
Desktop-Commander search_code --pattern "[Foutpatroon]" --context 5 --files "[Relevante bestanden]"
```

**GitHub Instructies:**
```
GitHub blame --file "[Probleembestand]" --line_range "[Probleemregels]"
GitHub history --file "[Probleembestand]" --since "[Laatste werkende versie]"
```

**Sequential-Thinking Instructies:**
```
Sequential-Thinking hypothesis --problem "[Bug beschrijving]" --evidence "[Verzamelde diagnostische data]" --test_plan true
```

**Memory Instructies:**
```
Memory query --filter "category:bug,similar_to:[huidige symptomen]" --sort "recency"
```

### 3.3 Fase 3: Oplossing Ontwerp

| Stap | Beschrijving | MCP Tools | Input | Output |
|------|-------------|-----------|-------|--------|
| 3.1 | **Oplossingsstrategieën** | Sequential-Thinking, Context7 | Root cause(s) | Mogelijke oplossingen |
| 3.2 | **Impact Analyse** | TaskMaster-AI | Mogelijke oplossingen | Risico-assessment |
| 3.3 | **Oplossing Selectie** | Memory, GitHub | Risico-assessment | Gekozen oplossing |
| 3.4 | **Implementatieplan** | TaskMaster-AI | Gekozen oplossing | Gedetailleerd actieplan |

#### Gedetailleerde Tool Instructies voor Fase 3:

**Sequential-Thinking Instructies:**
```
Sequential-Thinking solutions --problem "[Bug beschrijving]" --root_cause "[Geïdentificeerde oorzaak]" --constraints "[Project beperkingen]"
```

**Context7 Instructies:**
```
Context7 load --name "[Gerelateerde_Component]_Architecture"
Context7 load --name "Best_Practices_[Domein]"
```

**TaskMaster-AI Instructies:**
```
TaskMaster-AI analyze_impact --change "[Voorgestelde oplossing]" --components "[Betrokken componenten]"
TaskMaster-AI create_task --title "Fix [Bug ID]: [Korte beschrijving]" --description "[Gedetailleerde fix beschrijving]" --priority "[prioriteit]"
```

**GitHub Instructies:**
```
GitHub search_issues --query "is:issue [keywords van bug]" --state "closed"
```

### 3.4 Fase 4: Implementatie en Testen

| Stap | Beschrijving | MCP Tools | Input | Output |
|------|-------------|-----------|-------|--------|
| 4.1 | **Fix Implementatie** | Desktop-Commander, GitHub | Implementatieplan | Code wijzigingen |
| 4.2 | **Regressietesten** | Puppeteer, Desktop-Commander | Code wijzigingen | Testresultaten |
| 4.3 | **Performance Verificatie** | Desktop-Commander | Geïmplementeerde fix | Performance metrics |
| 4.4 | **Code Review** | GitHub | Code wijzigingen | Review feedback |

#### Gedetailleerde Tool Instructies voor Fase 4:

**Desktop-Commander Instructies:**
```
Desktop-Commander edit_file --path "[Probleembestand]" --mode "intelligent" --instructions "[Fix instructies]"
Desktop-Commander run --script "run_tests" --args "--suite [betrokken module] --regression true"
```

**GitHub Instructies:**
```
GitHub create_branch --name "bugfix/[bug-id]-[korte-beschrijving]" --from "main"
GitHub commit --message "Fix #[bug-id]: [Korte beschrijving van fix]" --files "[Gewijzigde bestanden]"
GitHub create_pr --title "Fix #[bug-id]: [Titel]" --body "[Gedetailleerde beschrijving van probleem en oplossing]" --reviewers "[Lijst van reviewers]"
```

**Puppeteer Instructies:**
```
Puppeteer run_tests --path "./tests/e2e/[relevante_tests]" --headless true --report "./reports/fix-validation.html"
```

### 3.5 Fase 5: Verificatie en Preventie

| Stap | Beschrijving | MCP Tools | Input | Output |
|------|-------------|-----------|-------|--------|
| 5.1 | **Gebruikersvalidatie** | Puppeteer | Geïmplementeerde fix | Validatierapport |
| 5.2 | **Kennisborging** | Memory, Context7 | Fix details, Root cause | Kennisartikelen |
| 5.3 | **Preventieve Maatregelen** | TaskMaster-AI, GitHub | Root cause analyse | Preventieve taken |
| 5.4 | **Proces Verbetering** | Memory | Probleemoplossingsproces | Procesverbeteringen |

#### Gedetailleerde Tool Instructies voor Fase 5:

**Puppeteer Instructies:**
```
Puppeteer validate_scenario --script "[Oorspronkelijk reproductiescenario]" --expected "success"
```

**Memory Instructies:**
```
Memory store --key "fixes.[bug_id]" --value "[Bug titel]" --content "[Gedetailleerde beschrijving van probleem, oorzaak en oplossing]" --tags "[relevante tags]"
```

**Context7 Instructies:**
```
Context7 store --name "Lesson_Learned_[bug_id]" --content "[Geleerde les en preventieve maatregelen]" --tags "lessons,prevention"
```

**TaskMaster-AI Instructies:**
```
TaskMaster-AI create_task --title "Prevent [Bug type]: [Preventieve maatregel]" --description "[Gedetailleerde beschrijving van preventieve actie]" --priority "medium"
```

## 4. Probleemtypes en Specifieke Workflows

### 4.1 UI/UX Bugs

Stap-voor-stap workflow voor het oplossen van UI/UX bugs:

1. **Probleem Identificatie**
   ```
   Puppeteer create_test --name "Reproduceer_UI_Bug_[id]" --steps "[Stappen om bug te reproduceren]" --screenshot true
   Memory query --filter "category:ui_bugs,component:[betrokken component]" --sort "relevance"
   ```

2. **Root Cause Analyse**
   ```
   Desktop-Commander search_code --pattern "className.*[betrokken component]" --files "src/components/**.jsx"
   MagicUI analyze_component --component "[Problematische Component]" --render_tree true
   ```

3. **Oplossing Ontwerp**
   ```
   MagicUI suggest_fix --component "[Problematische Component]" --issue "[Bug beschrijving]"
   Sequential-Thinking solutions --problem "[UI Bug beschrijving]" --constraints "browser-compatibility,responsive"
   ```

4. **Implementatie en Testen**
   ```
   Desktop-Commander edit_file --path "src/components/[component].jsx" --mode "intelligent" --instructions "[Fix instructies]"
   Puppeteer run_tests --path "./tests/e2e/ui/[component].test.js" --browsers "chrome,firefox,safari" --viewports "mobile,tablet,desktop"
   ```

5. **Verificatie en Preventie**
   ```
   Memory store --key "ui_patterns.avoid.[bug_type]" --value "[Probleem patroon]" --content "[Hoe dit probleem in de toekomst te vermijden]"
   TaskMaster-AI create_task --title "Add UI test for [scenario]" --description "Prevent regression of fixed UI bug #[bug_id]"
   ```

### 4.2 Performance Issues

Stap-voor-stap workflow voor het oplossen van performance problemen:

1. **Probleem Identificatie**
   ```
   Desktop-Commander profile --app "[App URL]" --scenario "[Traag scenario]" --output "./diagnostics/performance_profile.json"
   Sequential-Thinking decompose --process "Diagnose Performance Issue" --steps_format "genummerd" --include_metrics true
   ```

2. **Root Cause Analyse**
   ```
   Desktop-Commander analyze_profile --file "./diagnostics/performance_profile.json" --threshold 100 --sort "duration"
   Memory query --filter "category:performance,component:[betrokken component]" --sort "relevance"
   ```

3. **Oplossing Ontwerp**
   ```
   Sequential-Thinking solutions --problem "Performance bottleneck in [component]" --root_cause "[Geïdentificeerde oorzaak]" --constraints "backwards-compatible,minimal-changes"
   Context7 load --name "Performance_Best_Practices"
   ```

4. **Implementatie en Testen**
   ```
   Desktop-Commander edit_file --path "[Probleembestand]" --mode "intelligent" --instructions "[Optimalisatie instructies]"
   Desktop-Commander profile --app "[App URL]" --scenario "[Eerder traag scenario]" --compare "./diagnostics/performance_profile.json"
   ```

5. **Verificatie en Preventie**
   ```
   Memory store --key "performance.improvements.[component]" --value "[Optimalisatie titel]" --content "[Gedetailleerde beschrijving van optimalisatie]"
   TaskMaster-AI create_task --title "Add performance test for [component]" --description "Monitor performance metrics for [component] to prevent regression"
   ```

### 4.3 Security Vulnerabilities

Stap-voor-stap workflow voor het oplossen van beveiligingsproblemen:

1. **Probleem Identificatie**
   ```
   Desktop-Commander security_scan --target "[Component/API]" --output "./security/scan_results.json"
   Context7 load --name "Security_Standards_[Domein]"
   ```

2. **Root Cause Analyse**
   ```
   Desktop-Commander search_code --pattern "[Vulnerability pattern]" --files "[Relevante bestanden]" --security_context true
   GitHub blame --file "[Kwetsbaar bestand]" --line_range "[Kwetsbare regels]"
   ```

3. **Oplossing Ontwerp**
   ```
   Sequential-Thinking solutions --problem "[Security vulnerability]" --root_cause "[Geïdentificeerde oorzaak]" --constraints "security-first,compliance"
   Memory query --filter "category:security_fixes,vulnerability_type:[type]" --sort "relevance"
   ```

4. **Implementatie en Testen**
   ```
   Desktop-Commander edit_file --path "[Kwetsbaar bestand]" --mode "secure" --instructions "[Security fix instructies]"
   Desktop-Commander security_scan --target "[Component/API]" --output "./security/post_fix_scan.json" --compare "./security/scan_results.json"
   ```

5. **Verificatie en Preventie**
   ```
   Memory store --key "security.vulnerabilities.[type]" --value "[Vulnerability titel]" --content "[Gedetailleerde beschrijving en preventie]"
   TaskMaster-AI create_task --title "Security review for [gerelateerde componenten]" --priority "high"
   GitHub create_issue --title "Security: Add [type] protection to CI pipeline" --labels "security,prevention"
   ```

## 5. MCP Tools Integratie Matrix voor Probleemoplossing

De volgende matrix toont welke MCP tools primair worden gebruikt in elke fase van het probleemoplossingsplan:

| Fase | Sequential-Thinking | Context7 | TaskMaster-AI | Desktop-Commander | GitHub | MagicUI | Memory | Puppeteer |
|------|---------------------|----------|---------------|-------------------|--------|---------|--------|-----------|
| 1. Probleem Identificatie | ✅ | ✅ | ✅ | ✅ | ⚪ | ⚪ | ✅ | ✅ |
| 2. Root Cause Analyse | ✅ | ✅ | ⚪ | ✅ | ✅ | ⚪ | ✅ | ⚪ |
| 3. Oplossing Ontwerp | ✅ | ✅ | ✅ | ⚪ | ✅ | ✅ | ✅ | ⚪ |
| 4. Implementatie | ⚪ | ⚪ | ⚪ | ✅ | ✅ | ✅ | ⚪ | ✅ |
| 5. Verificatie | ⚪ | ✅ | ✅ | ⚪ | ✅ | ⚪ | ✅ | ✅ |

Legenda: ✅ = Primair gebruik, ⚪ = Secundair/optioneel gebruik

## 6. Diagnose Technieken per Probleemtype

### 6.1 Frontend Problemen

| Probleemtype | Diagnose Techniek | MCP Tools | Specifieke Instructies |
|--------------|-------------------|-----------|------------------------|
| Rendering Issues | DOM Inspectie | Puppeteer, Desktop-Commander | `Puppeteer evaluate --script "document.querySelector('[selector]').getBoundingClientRect()"` |
| State Management | State Tracing | Desktop-Commander | `Desktop-Commander debug --breakpoints "src/store/[module].js:[lijnnummer]" --watch "state.[property]"` |
| Styling Conflicts | CSS Analyse | MagicUI, Desktop-Commander | `MagicUI analyze_styles --component "[Component]" --conflicts true` |
| Browser Compatibility | Cross-browser Testing | Puppeteer | `Puppeteer run_tests --browsers "chrome,firefox,safari,edge" --test "[test_script]"` |

### 6.2 Backend Problemen

| Probleemtype | Diagnose Techniek | MCP Tools | Specifieke Instructies |
|--------------|-------------------|-----------|------------------------|
| API Errors | Request/Response Logging | Desktop-Commander | `Desktop-Commander intercept --endpoint "/api/[route]" --log_requests true --log_responses true` |
| Database Issues | Query Analyse | Desktop-Commander | `Desktop-Commander database --query "EXPLAIN [problematische query]" --connection "[connection string]"` |
| Memory Leaks | Heap Profiling | Desktop-Commander | `Desktop-Commander heap_snapshot --process "[proces id]" --interval 30 --duration 300` |
| Concurrency Issues | Thread Dump | Desktop-Commander | `Desktop-Commander thread_dump --process "[proces id]" --repeat 5 --interval 10` |

### 6.3 Integratie Problemen

| Probleemtype | Diagnose Techniek | MCP Tools | Specifieke Instructies |
|--------------|-------------------|-----------|------------------------|
| API Contract Violations | Interface Validation | Desktop-Commander, Context7 | `Desktop-Commander validate_api --spec "[OpenAPI spec]" --endpoint "/api/[route]"` |
| Authentication Failures | Auth Flow Tracing | Desktop-Commander, Puppeteer | `Puppeteer auth_flow --credentials "[test credentials]" --capture_tokens true` |
| Dependency Conflicts | Dependency Analyse | Desktop-Commander | `Desktop-Commander analyze_dependencies --project "[Project Pad]" --conflicts true` |
| Network Issues | Network Monitoring | Desktop-Commander, Puppeteer | `Desktop-Commander monitor_network --target "[service URL]" --duration 300 --metrics "latency,errors,throughput"` |

## 7. Best Practices voor Probleemoplossing

### 7.1 Algemene Principes
- Begin altijd met het reproduceren van het probleem
- Isoleer het probleem zoveel mogelijk
- Verzamel diagnostische data voordat je oplossingen implementeert
- Documenteer zowel het probleem als de oplossing
- Test de oplossing in verschillende omgevingen

### 7.2 Tool-specifieke Best Practices

**Sequential-Thinking Best Practices voor Debugging:**
- Formuleer meerdere hypotheses voor elk probleem
- Test hypotheses in volgorde van waarschijnlijkheid
- Documenteer zowel succesvolle als onsuccesvolle tests
- Gebruik gestructureerde decompositie om complexe bugs op te delen

**Desktop-Commander Best Practices voor Diagnostiek:**
- Gebruik logging strategisch (niet te veel, niet te weinig)
- Maak herbruikbare diagnostische scripts
- Combineer meerdere diagnostische technieken
- Vergelijk metrics voor en na fixes

**Memory Best Practices voor Kennisborging:**
- Categoriseer bugs consistent
- Link gerelateerde problemen aan elkaar
- Documenteer zowel symptomen als root causes
- Voeg preventieve maatregelen toe aan elke bug entry

**Puppeteer Best Practices voor Reproductie:**
- Maak reproductiescripts zo minimaal mogelijk
- Gebruik screenshots op kritieke punten
- Test in meerdere browsers en viewports
- Automatiseer validatie van fixes

## 8. KPI's en Metrics voor Probleemoplossing

Het succes van dit probleemoplossingsplan wordt gemeten aan de hand van de volgende metrics:

1. **Oplossingsefficiëntie**
   - Gemiddelde tijd van bug rapportage tot oplossing
   - Percentage bugs opgelost bij eerste poging
   - Aantal iteraties per bug fix

2. **Kwaliteitsmetrics**
   - Percentage regressies na fixes
   - Testdekking van gefixte code
   - Aantal gerelateerde bugs na fix

3. **Kennisborging**
   - Volledigheid van bug documentatie
   - Hergebruik van opgeslagen oplossingen
   - Effectiviteit van preventieve maatregelen

4. **Procestrouw**
   - Percentage bugs dat het volledige proces doorloopt
   - Kwaliteit van root cause analyses
   - Consistentie in diagnose technieken

## 9. Conclusie

Dit gestructureerde probleemoplossingsplan met MCP tools biedt een methodische aanpak voor het identificeren, analyseren en oplossen van technische problemen. Door het systematisch doorlopen van de vijf fasen (Probleem Identificatie, Root Cause Analyse, Oplossing Ontwerp, Implementatie en Verificatie) en het strategisch inzetten van de juiste MCP tools per fase, wordt een grondige, efficiënte probleemoplossing gewaarborgd.

Het plan is flexibel genoeg om te worden toegepast op verschillende soorten problemen, van eenvoudige UI bugs tot complexe performance en security issues. Door de best practices te volgen en de KPI's te monitoren, kan het probleemoplossingsproces voortdurend worden verbeterd, wat leidt tot een steeds effectievere inzet van AI debugging agents en een steeds hogere software kwaliteit.

Door systematisch problemen op te lossen en de geleerde lessen vast te leggen, draagt dit plan niet alleen bij aan het oplossen van huidige issues, maar ook aan het voorkomen van toekomstige problemen, wat resulteert in een robuustere, betrouwbaardere software.
