import os
import re

MODULES_DIR = r"d:\USUARIO\Desktop\complejo\src\modules"

def scan_modules():
    missing_files = []
    
    for module_name in os.listdir(MODULES_DIR):
        module_path = os.path.join(MODULES_DIR, module_name)
        if not os.path.isdir(module_path):
            continue
            
        index_path = os.path.join(module_path, "index.jsx")
        if not os.path.exists(index_path):
            print(f"Module {module_name} is missing index.jsx")
            continue
            
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Find imports like: import Something from './pages/Something'
        # Matches './pages/Something', './components/Something', etc.
        imports = re.findall(r"import\s+(\w+)\s+from\s+['\"](\.\/.*?)['\"]", content)
        
        for component_name, import_path in imports:
            # Resolve the path
            # If import_path is './pages/Something', it should be in module_path/pages/Something.jsx (or .js)
            target_path = os.path.join(module_path, import_path.strip("./"))
            
            # Check for .jsx or .js or .tsx or .ts
            found = False
            for ext in [".jsx", ".js", ".tsx", ".ts"]:
                if os.path.exists(target_path + ext):
                    found = True
                    break
                    
            if not found:
                missing_files.append({
                    "module": module_name,
                    "component": component_name,
                    "path": target_path + ".jsx"
                })
                
    return missing_files

if __name__ == "__main__":
    missing = scan_modules()
    if not missing:
        print("No missing files found!")
    else:
        for m in missing:
            print(f"MISSING: {m['path']} (Module: {m['module']}, Component: {m['component']})")
