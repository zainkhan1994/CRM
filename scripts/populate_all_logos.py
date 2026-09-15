import json, os, re, shutil, subprocess, urllib.request

ICLOUD_ROOT = "/Users/xainkhan/Library/Mobile Documents/com~apple~CloudDocs/1 System/Blueprint"
DEST_DIR = "v2/logos"
os.makedirs(DEST_DIR, exist_ok=True)

# Build index of all iCloud files
def get_icloud_files():
    files = []
    if not os.path.exists(ICLOUD_ROOT):
        return files
    for root, dirs, fnames in os.walk(ICLOUD_ROOT):
        for f in fnames:
            if f.lower().endswith(('.png', '.svg', '.webp', '.jpg', '.jpeg', '.ico')):
                files.append(os.path.join(root, f))
    return files

icloud_files = get_icloud_files()
print(f"Found {len(icloud_files)} images in iCloud Blueprint")

# Known explicit mappings: node_id -> { "file": ..., "domain": ..., "url": ... }
EXPLICIT = {
    "pr-mlh": {"file": "mlh.svg"},
    "p-events-mlh": {"file": "mlh.svg"},
    "p-ai-openai": {"file": "brand-paiopenai.png"},
    "pr-ai-openai": {"file": "brand-paiopenai.png"},
    "p-ai-claude": {"file": "brand-paiclaude.png"},
    "pr-ai-claude": {"file": "brand-paiclaude.png"},
    "p-ai-gemini": {"file": "brand-paigemini.png"},
    "p-ai-perplexity": {"file": "library-8e348bb1bfcc.png"},
    "pr-ai-perplexity": {"file": "library-8e348bb1bfcc.png"},
    "p-ai-rewind": {"file": "library-f170527ef3e4.png"},
    "pr-ai-rewind": {"file": "library-f170527ef3e4.png"},
    "w-tools-github": {"file": "brand-github.svg"},
    "pr-pm-github": {"file": "brand-github.svg"},
    "p-tech-github": {"file": "brand-github.svg"},
    "p-events-gh": {"file": "brand-github.svg"},
    "w-tools-asana": {"file": "library-d10340a3b87f.png"},
    "pr-pm-asana": {"file": "library-d10340a3b87f.png"},
    "w-tools-miro": {"file": "library-76d74cb0510d.png"},
    "pr-pm-miro": {"file": "library-76d74cb0510d.png"},
    "w-tools-slack": {"file": "brand-social.png"},
    "p-social-slack": {"file": "brand-social.png"},
    "p-accounts-amex": {"file": "american-express.svg"},
    "p-accounts-applecard": {"file": "apple-card.png"},
    "removed-dev0": {"file": "gdg-tulsa.png"},
    "removed-dev1": {"file": "techlahoma.png"},
    "removed-dev2": {"file": "ai-tinkerers.png"},
    "removed-dev3": {"file": "meetup.png"},
    "p-social-meetup": {"file": "meetup.png"},
    "p-events-tulsaai": {"file": "meetup.png"},
    "p-learn-atlas-school": {"domain": "atlasschool.com"},
    "w-emp-rcubed": {"file": "brand-emrcubed.webp"},
    "p-bills-pso": {"file": "brand-billsutilities.svg"},
    "p-bills-ong": {"file": "brand-billsgas.svg"}
}

# Domain dictionary for all nodes
DOMAINS = {
    # Accounts & Banking
    "p-accounts-chase": "chase.com",
    "p-accounts-bofa": "bankofamerica.com",
    "p-accounts-wf": "wellsfargo.com",
    "p-accounts-creditone": "creditonebank.com",
    "p-accounts-indigo": "indigocard.com",
    "p-accounts-nordstrom": "nordstrom.com",
    "p-accounts-synchrony": "synchrony.com",
    "p-accounts-robinhood": "robinhood.com",
    "p-accounts-ubiquity": "myubiquity.com",
    "p-accounts-mtrust": "mtrustcompany.com",
    "p-accounts-primerica": "primerica.com",
    "p-accounts-xoom": "xoom.com",
    "p-accounts-kikoff": "kikoff.com",
    "p-accounts-chime": "chime.com",
    "p-accounts-perpay": "perpay.com",
    "p-accounts-upstart": "upstart.com",
    "p-accounts-greatlakes": "mygreatlakes.org",
    "p-accounts-lexlaw": "lexingtonlaw.com",
    "p-accounts-labaton": "labaton.com",
    "p-accounts-bullock": "bullocklegal.com",
    "p-accounts-gilligan": "glawtx.com",
    "p-accounts-moody": "moodylegal.com",
    "p-accounts-othercards": "visa.com",

    # Bills & Utilities
    "p-bills-pso": "psoklahoma.com",
    "p-bills-ong": "oklahomanaturalgas.com",
    "p-bills-gokinetic": "gokinetic.com",
    "p-bills-windstream": "windstream.com",
    "p-bills-att": "att.com",
    "p-bills-tmobile": "t-mobile.com",
    "p-bills-comcast": "business.comcast.com",

    # Shopping
    "p-shop-amazon": "amazon.com",
    "p-shop-walmart": "walmart.com",
    "p-shop-target": "target.com",
    "p-shop-bestbuy": "bestbuy.com",
    "p-shop-homedepot": "homedepot.com",
    "p-shop-lowes": "lowes.com",
    "p-shop-officedepot": "officedepot.com",
    "p-shop-ebay": "ebay.com",
    "p-shop-etsy": "etsy.com",
    "p-shop-michaels": "michaels.com",
    "p-shop-kohls": "kohls.com",
    "p-shop-tjx": "tjmaxx.tjx.com",
    "p-shop-fivebelow": "fivebelow.com",
    "p-shop-gamestop": "gamestop.com",
    "p-shop-bn": "barnesandnoble.com",
    "p-shop-doordash": "doordash.com",
    "p-shop-starbucks": "starbucks.com",
    "p-shop-hellofresh": "hellofresh.com",
    "p-shop-factor": "factor75.com",
    "p-shop-thrive": "thrivemarket.com",
    "p-shop-culvers": "culvers.com",
    "p-shop-daves": "daveshotchicken.com",
    "p-shop-pizzahut": "pizzahut.com",
    "p-shop-peiwei": "peiwei.com",
    "p-shop-nbcakes": "nothingbundtcakes.com",
    "p-shop-fedex": "fedex.com",
    "p-shop-ups": "ups.com",
    "p-shop-usps": "usps.com",
    "p-shop-honey": "joinhoney.com",
    "p-shop-topcashback": "topcashback.com",
    "p-shop-nift": "gonift.com",

    # Travel & Navigation
    "p-travel-delta": "delta.com",
    "p-travel-united": "united.com",
    "p-travel-southwest": "southwest.com",
    "p-travel-aa": "aa.com",
    "p-travel-emirates": "emirates.com",
    "p-travel-airbnb": "airbnb.com",
    "p-travel-hilton": "hilton.com",
    "p-travel-marriott": "marriott.com",
    "p-travel-hyatt": "hyatt.com",
    "p-travel-ihg": "ihg.com",
    "p-travel-hotels": "hotels.com",
    "p-travel-hotwire": "hotwire.com",
    "p-travel-uber": "uber.com",
    "p-travel-lyft": "lyft.com",
    "p-travel-parkmobile": "parkmobile.io",
    "p-travel-spothero": "spothero.com",
    "p-travel-honk": "honkforhelp.com",
    "p-travel-rentalcars": "airportrentalcars.com",
    "p-travel-cheapoair": "cheapoair.com",
    "p-travel-vtg": "vacationstogo.com",

    # Events & Communities
    "p-events-nasa": "nasa.gov",
    "p-events-google": "google.com",
    "p-events-ms": "microsoft.com",
    "p-events-ion": "ionhouston.com",
    "p-events-buildtulsa": "buildintulsa.com",
    "p-events-hecw": "houstonenergyclimateweek.com",
    "p-events-houhack": "houstonhackathon.com",
    "p-events-dtp": "downtowntulsa.com",
    "p-events-exp": "visittulsa.com",
    "p-events-fablab": "fablabtulsa.org",
    "p-events-typros": "typros.org",
    "p-events-tulsaero": "tulsaaerospace.com",
    "p-events-eventbrite": "eventbrite.com",
    "p-events-ticketmaster": "ticketmaster.com",
    "p-events-seatgeek": "seatgeek.com",
    "p-events-tixr": "tixr.com",
    "p-events-fevo": "fevo.com",
    "p-events-evite": "evite.com",

    # Social & Direct Messaging
    "p-social-facebook": "facebook.com",
    "p-social-instagram": "instagram.com",
    "p-social-tiktok": "tiktok.com",
    "p-social-snapchat": "snapchat.com",
    "p-social-youtube": "youtube.com",
    "p-social-linkedin": "linkedin.com",
    "p-social-reddit": "reddit.com",
    "p-social-nextdoor": "nextdoor.com",
    "p-social-discord": "discord.com",
    "p-social-textfree": "textfree.us",
    "p-social-groups-eb": "eventbrite.com",
    "p-social-ggroups": "groups.google.com",

    # Meetings & Scheduling
    "p-meetings-fireflies": "fireflies.ai",
    "p-meetings-calendly": "calendly.com",
    "p-meetings-cal": "cal.com",
    "p-meetings-koalendar": "koalendar.com",
    "p-meetings-doodle": "doodle.com",
    "p-meetings-oncehub": "oncehub.com",
    "p-meetings-chilipiper": "chilipiper.com",
    "p-meetings-zoom": "zoom.us",
    "p-meetings-gmeet": "meet.google.com",
    "p-meetings-teams": "teams.microsoft.com",

    # Learning
    "p-learn-brilliant": "brilliant.org",
    "p-learn-mimo": "mimo.org",
    "p-learn-noji": "noji.io",
    "p-learn-coursera": "coursera.org",
    "p-learn-coursehero": "coursehero.com",
    "p-learn-leetcode": "leetcode.com",
    "p-learn-quizlet": "quizlet.com",
    "p-learn-typing": "typing.com",
    "p-learn-ibm": "skillsbuild.org",
    "p-learn-uipath": "uipath.com",

    # Tech & Cloud
    "p-tech-google": "google.com",
    "p-tech-microsoft": "microsoft.com",
    "p-tech-apple": "apple.com",
    "p-tech-dropbox": "dropbox.com",
    "p-tech-box": "box.com",
    "p-tech-onedrive": "onedrive.live.com",
    "p-tech-vercel": "vercel.com",
    "p-tech-netlify": "netlify.com",
    "p-tech-do": "digitalocean.com",
    "p-tech-supabase": "supabase.com",

    # AI Tools
    "p-ai-midjourney": "midjourney.com",
    "p-ai-elevenlabs": "elevenlabs.io",
    "p-ai-synthesia": "synthesia.io",
    "p-ai-limitless": "limitless.ai",

    # Research & Surveys
    "p-research-ut": "usertesting.com",
    "p-research-ui": "userinterviews.com",
    "p-research-fi": "focusinsite.com",
    "p-research-fpg": "focuspointeglobal.com",
    "p-research-rpv": "rarepatientvoice.com",
    "p-research-wilkins": "wilkinsresearch.net",
    "p-research-angus": "angusreidforum.com",
    "p-research-ipsos": "ipsosisay.com",

    # Entertainment & Media
    "p-ent-netflix": "netflix.com",
    "p-ent-disney": "disneyplus.com",
    "p-ent-prime": "primevideo.com",
    "p-ent-crunchy": "crunchyroll.com",
    "p-ent-hbo": "max.com",
    "p-ent-hulu": "hulu.com",
    "p-ent-paramount": "paramountplus.com",
    "p-ent-peacock": "peacocktv.com",
    "p-ent-starz": "starz.com",
    "p-ent-vudu": "vudu.com",
    "p-ent-spotify": "spotify.com",
    "p-ent-soundcloud": "soundcloud.com",
    "p-ent-sony": "sony.com",
    "p-ent-amc": "amctheatres.com",
    "p-ent-fandango": "fandango.com",
    "p-ent-marvel": "marvel.com",
    "p-ent-wbgames": "warnerbrosgames.com",
    "p-ent-twitch": "twitch.tv",
    "p-ent-whatnot": "whatnot.com",

    # Government & Civic
    "p-gov-nasa": "nasa.gov",
    "p-gov-usps": "usps.com",
    "p-gov-irs": "irs.gov",
    "p-gov-census": "census.gov",
    "p-gov-tulsa": "cityoftulsa.org",
    "p-gov-houston": "houstontx.gov",
    "p-gov-fortbend": "fortbendcountytx.gov",
    "p-gov-twc": "twc.texas.gov",
    "p-gov-vote": "vote.org",
    "p-gov-login": "login.gov",

    # Daily Life & Email
    "p-daily-gmail": "gmail.com",
    "p-daily-outlook": "outlook.com",
    "p-daily-yahoo": "yahoo.com",
    "p-daily-appleid": "apple.com",
    "p-daily-routines": "apple.com",
    "p-daily-accounts": "google.com",
    "p-people-family": "apple.com",
    "p-people-friends": "apple.com",
    "p-people-gmail": "gmail.com",
    "p-people-yahoo": "yahoo.com",
    "p-people-hotmail": "outlook.com",
    "p-people-aol": "aol.com",
    "p-people-icloud": "icloud.com",
    "p-people-other": "email.com",
    "p-people-networking": "linkedin.com",

    # Newsletters
    "p-news-beehiiv": "beehiiv.com",
    "p-news-substack": "substack.com",
    "p-news-medium": "medium.com",
    "p-news-dailydev": "daily.dev",
    "p-news-roadmap": "roadmap.sh",

    # Jobs
    "p-jobs-indeed": "indeed.com",
    "p-jobs-li": "linkedin.com",
    "p-jobs-zr": "ziprecruiter.com",
    "p-jobs-workable": "workable.com",
    "p-jobs-greenhouse": "greenhouse.io",
    "p-jobs-lever": "lever.co",

    # Housing & Real Estate
    "p-housing-apts": "apartments.com",
    "p-housing-appfolio": "appfolio.com",
    "p-housing-realpage": "realpage.com",
    "p-housing-ess": "extraspace.com",
    "p-housing-lifestorage": "lifestorage.com",

    # Auto
    "p-auto-autonation": "autonation.com",
    "p-auto-sf": "statefarm.com",
    "p-auto-prog": "progressive.com",

    # Nonprofits & Causes
    "p-np-launchgood": "launchgood.com",
    "p-np-gofundme": "gofundme.com",
    "p-np-actblue": "actblue.com",
    "p-np-wikimedia": "wikimedia.org",
    "p-np-hhrd": "irusa.org",

    # Insurance
    "p-ins-sf": "statefarm.com",
    "p-ins-prog": "progressive.com",
    "p-ins-nyl": "newyorklife.com",
    "p-ins-primerica": "primerica.com",

    # Health Providers
    "h-prov-hillcrest-med": "hillcrestmedicalcenter.com",
    "h-prov-utica": "uticaparkclinic.com",
    "h-prov-asc-stjohn": "healthcare.ascension.org",
    "h-prov-asc-ok": "healthcare.ascension.org",
    "h-prov-asc-health": "healthcare.ascension.org",
    "h-prov-hm": "houstonmethodist.org",
    "h-prov-mdacc": "mdanderson.org",
    "h-prov-kelsey": "kelsey-seybold.com",
    "h-prov-kaiser": "kaiserpermanente.org",
    "h-prov-complete-derm": "completedermatology.com",
    "h-prov-tulsaderm": "tulsaderm.com",
    "h-prov-dtd": "downtowntulsadental.com",
    "h-prov-eldridge": "eldridgedental.com",
    "h-prov-advanced": "advanceddentistryhouston.com",
    "h-prov-urbn": "urbndental.com",
    "h-prov-vpj": "varghesejohn.com",

    # Telehealth
    "h-tele-healow": "healow.com",
    "h-tele-mychart": "mychart.com",
    "h-tele-skymd": "skymd.com",
    "h-tele-dod": "doctorondemand.com",
    "h-tele-bh": "betterhelp.com",
    "h-tele-zocdoc": "zocdoc.com",

    # Labs & Diagnostics
    "h-labs-labcorp": "labcorp.com",
    "h-labs-quest": "questdiagnostics.com",
    "h-labs-ct": "clinicaltrials.gov",
    "h-labs-s37": "science37.com",
    "h-labs-care": "careaccess.com",
    "h-labs-iqvia": "iqvia.com",
    "h-labs-cw": "centerwatch.com",

    # Pharmacy
    "h-pharm-cvs": "cvs.com",
    "h-pharm-walgreens": "walgreens.com",
    "h-pharm-amazon": "pharmacy.amazon.com",
    "h-pharm-nimble": "nimblerx.com",
    "h-pharm-goodrx": "goodrx.com",

    # Blood & Plasma
    "h-blood-gulfcoast": "giveblood.org",
    "h-blood-obi": "obi.org",
    "h-blood-csl": "cslplasma.com",
    "h-blood-biolife": "biolifeplasma.com",
    "h-blood-grifols": "grifolsplasma.com",

    # Fitness
    "h-fit-lifetime": "lifetime.life",
    "h-fit-la": "lafitness.com",
    "h-fit-equinox": "equinox.com",
    "h-fit-anytime": "anytimefitness.com",
    "h-fit-genesis": "genesishealthclubs.com",
    "h-fit-hotworx": "hotworx.net",
    "h-fit-maxout": "maxoutfitness.com",
    "h-fit-toennies": "toenniesfitness.com",
    "h-fit-ymca": "ymcatulsa.org",

    # Health Insurance
    "h-ins-regence": "regence.com",
    "h-ins-optum": "optumbank.com",
    "h-ins-aflac": "aflac.com",
    "h-ins-marketplace": "healthcare.gov",
    "h-ins-hmarkets": "healthmarkets.com",
    "h-ins-nyl": "newyorklife.com",
    "h-ins-primerica": "primerica.com",
    "h-ins-kandk": "kandkinsurance.com",
    "h-ins-sf": "statefarm.com",

    # Patient Portals
    "h-portal-mychart": "mychart.com",
    "h-portal-healow": "healow.com",
    "h-portal-eclinical": "eclinicalworks.com",
    "h-portal-updox": "updox.com",
    "h-portal-relatient": "relatient.com",
    "h-portal-visitpay": "visitpay.com",
    "h-portal-docubill": "docubill.com",

    # Work Employers
    "w-emp-redriver": "redriverdevelopment.com",
    "w-emp-trulo": "trulohomes.com",
    "w-emp-roserock": "roserockdevelopment.com",
    "w-emp-minaret": "minaretfoundation.com",
    "w-emp-ashford": "ashfordcommunities.com",
    "w-emp-census": "census.gov",
    "w-emp-gulfcoast": "giveblood.org",
    "w-emp-isgh": "isgh.org",
    "w-emp-amazonflex": "flex.amazon.com",

    # Work Tools
    "w-tools-notion": "notion.so",
    "w-tools-obsidian": "obsidian.md"
}

# Download helper
def download_favicon(domain, dest_path):
    url = f"https://www.google.com/s2/favicons?domain={domain}&sz=128"
    try:
        cmd = ["curl", "-sL", url, "-o", dest_path]
        subprocess.run(cmd, check=True, timeout=10)
        if os.path.exists(dest_path) and os.path.getsize(dest_path) > 200:
            return True
    except Exception as e:
        print(f"Error downloading {domain}: {e}")
    return False

# Process blueprint.json
with open("v2/blueprint.json") as f:
    blueprint = json.load(f)

parent_ids = {n["parentId"] for n in blueprint if n.get("parentId")}
leaves = [n for n in blueprint if n["id"] not in parent_ids]
print(f"Processing {len(leaves)} leaf nodes in blueprint.json")

updated_count = 0

for node in leaves:
    nid = node["id"]
    name = node["name"]
    current_logo = node.get("logo")
    
    # If it already has a valid logo pointing to an existing file in v2/logos, verify it
    if current_logo and os.path.exists(os.path.join("v2", current_logo)):
        continue
    
    assigned = False
    
    # 1. Check EXPLICIT mapping
    if nid in EXPLICIT:
        exp = EXPLICIT[nid]
        if "file" in exp and os.path.exists(os.path.join(DEST_DIR, exp["file"])):
            node["logo"] = f"logos/{exp['file']}"
            assigned = True
            updated_count += 1
            print(f"[{nid}] {name} -> EXPLICIT {exp['file']}")
            continue
        elif "domain" in exp:
            domain = exp["domain"]
            slug = re.sub(r"[^a-z0-9]", "-", name.lower()).strip("-")
            dest = os.path.join(DEST_DIR, f"{slug}.png")
            if not os.path.exists(dest):
                download_favicon(domain, dest)
            if os.path.exists(dest) and os.path.getsize(dest) > 200:
                node["logo"] = f"logos/{slug}.png"
                assigned = True
                updated_count += 1
                print(f"[{nid}] {name} -> EXPLICIT DOMAIN {domain} -> {slug}.png")
                continue

    # 2. Check DOMAINS mapping
    domain = DOMAINS.get(nid)
    if not domain:
        # Generate domain heuristic from name
        clean_name = re.sub(r"[^a-z0-9]", "", name.lower())
        domain = f"{clean_name}.com"

    slug = re.sub(r"[^a-z0-9]", "-", name.lower()).strip("-")
    dest = os.path.join(DEST_DIR, f"{slug}.png")
    
    if not os.path.exists(dest) or os.path.getsize(dest) <= 200:
        download_favicon(domain, dest)
    
    if os.path.exists(dest) and os.path.getsize(dest) > 200:
        node["logo"] = f"logos/{slug}.png"
        assigned = True
        updated_count += 1
        print(f"[{nid}] {name} -> DOMAIN {domain} -> {slug}.png")
    else:
        print(f"[{nid}] {name} FAILED to get logo for domain {domain}")

print(f"\nSuccessfully populated {updated_count} logos for leaf nodes!")

# Save updated blueprint.json
with open("v2/blueprint.json", "w") as f:
    json.dump(blueprint, f, indent=2)

print("Saved v2/blueprint.json")
