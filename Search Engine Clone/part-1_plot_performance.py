#!/usr/bin/env python3

"""
Performance Graph Generator for CS 140 Project 2 - Part 1
SPEC: Section 4.5 - Generate graphs showing duration vs NUM_THREADS
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os

# Configuration
STRUCTURES = ['connected', 'forest', 'full', 'random']
DATA_DIR = 'part-1-performance-data'
OUTPUT_DIR = 'part-1-performance-graphs'

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("=" * 50)
print("Generating Performance Graphs")
print("=" * 50)
print()

# ============================================================================
# Generate individual graphs for each structure
# ============================================================================

for structure in STRUCTURES:
    csv_file = f"{DATA_DIR}/{structure}_performance.csv"
    
    if not os.path.exists(csv_file):
        print(f"WARNING: {csv_file} not found, skipping...")
        continue
    
    print(f"Processing {structure}...")
    
    # Read data
    df = pd.read_csv(csv_file)
    
    # Calculate average duration for each thread count
    avg_data = df.groupby('threads')['duration_ms'].mean().reset_index()
    std_data = df.groupby('threads')['duration_ms'].std().reset_index()
    
    # Create figure
    plt.figure(figsize=(10, 6))
    
    # Plot average with error bars
    plt.errorbar(avg_data['threads'], 
                 avg_data['duration_ms'],
                 yerr=std_data['duration_ms'],
                 marker='o',
                 linewidth=2,
                 markersize=8,
                 capsize=5,
                 label=f'{structure} structure')
    
    # Add ideal speedup line for reference
    baseline = avg_data[avg_data['threads'] == 1]['duration_ms'].values[0]
    ideal_speedup = [baseline / t for t in avg_data['threads']]
    plt.plot(avg_data['threads'], ideal_speedup, 
             'r--', alpha=0.5, label='Ideal linear speedup')
    
    # Formatting
    plt.xlabel('Number of Threads', fontsize=12, fontweight='bold')
    plt.ylabel('Execution Time (ms)', fontsize=12, fontweight='bold')
    plt.title(f'Part 1 Performance: {structure.upper()} Structure\n'
              f'Execution Time vs Thread Count',
              fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)
    plt.legend(loc='upper right')
    plt.xticks(range(1, 11))
    
    # Save graph
    output_file = f"{OUTPUT_DIR}/{structure}_performance.png"
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    print(f"  Saved: {output_file}")
    plt.close()

# ============================================================================
# Generate combined comparison graph
# ============================================================================

print("\nGenerating combined comparison graph...")

plt.figure(figsize=(12, 7))

colors = {'connected': 'blue', 'forest': 'green', 'full': 'red', 'random': 'orange'}
markers = {'connected': 'o', 'forest': 's', 'full': '^', 'random': 'd'}

for structure in STRUCTURES:
    csv_file = f"{DATA_DIR}/{structure}_performance.csv"
    
    if not os.path.exists(csv_file):
        continue
    
    df = pd.read_csv(csv_file)
    avg_data = df.groupby('threads')['duration_ms'].mean().reset_index()
    
    plt.plot(avg_data['threads'], 
             avg_data['duration_ms'],
             marker=markers[structure],
             linewidth=2,
             markersize=8,
             color=colors[structure],
             label=f'{structure.capitalize()}')

plt.xlabel('Number of Threads', fontsize=12, fontweight='bold')
plt.ylabel('Execution Time (ms)', fontsize=12, fontweight='bold')
plt.title('Part 1 Performance Comparison\nAll Structure Types',
          fontsize=14, fontweight='bold')
plt.grid(True, alpha=0.3)
plt.legend(loc='upper right')
plt.xticks(range(1, 11))

output_file = f"{OUTPUT_DIR}/combined_performance.png"
plt.savefig(output_file, dpi=300, bbox_inches='tight')
print(f"  Saved: {output_file}")
plt.close()

# ============================================================================
# Generate speedup analysis graph
# ============================================================================

print("\nGenerating speedup analysis graph...")

plt.figure(figsize=(12, 7))

for structure in STRUCTURES:
    csv_file = f"{DATA_DIR}/{structure}_performance.csv"
    
    if not os.path.exists(csv_file):
        continue
    
    df = pd.read_csv(csv_file)
    avg_data = df.groupby('threads')['duration_ms'].mean().reset_index()
    
    # Calculate speedup relative to single thread
    baseline = avg_data[avg_data['threads'] == 1]['duration_ms'].values[0]
    speedup = [baseline / t for t in avg_data['duration_ms']]
    
    plt.plot(avg_data['threads'], 
             speedup,
             marker=markers[structure],
             linewidth=2,
             markersize=8,
             color=colors[structure],
             label=f'{structure.capitalize()}')

# Add ideal linear speedup reference
plt.plot(range(1, 11), range(1, 11), 
         'k--', alpha=0.5, linewidth=2, label='Ideal Linear Speedup')

plt.xlabel('Number of Threads', fontsize=12, fontweight='bold')
plt.ylabel('Speedup Factor', fontsize=12, fontweight='bold')
plt.title('Part 1 Speedup Analysis\nRelative to Single Thread',
          fontsize=14, fontweight='bold')
plt.grid(True, alpha=0.3)
plt.legend(loc='upper left')
plt.xticks(range(1, 11))
plt.yticks(range(1, 11))

output_file = f"{OUTPUT_DIR}/speedup_analysis.png"
plt.savefig(output_file, dpi=300, bbox_inches='tight')
print(f"  Saved: {output_file}")
plt.close()

# ============================================================================
# Generate performance table
# ============================================================================

print("\nGenerating performance summary table...")

summary_file = f"{OUTPUT_DIR}/performance_summary.txt"
with open(summary_file, 'w') as f:
    f.write("=" * 80 + "\n")
    f.write("PART 1 PERFORMANCE SUMMARY\n")
    f.write("=" * 80 + "\n\n")
    
    for structure in STRUCTURES:
        csv_file = f"{DATA_DIR}/{structure}_performance.csv"
        
        if not os.path.exists(csv_file):
            continue
        
        f.write(f"{structure.upper()} Structure\n")
        f.write("-" * 80 + "\n")
        f.write(f"{'Threads':<10} {'Avg Time (ms)':<15} {'Speedup':<15} {'Efficiency':<15}\n")
        f.write("-" * 80 + "\n")
        
        df = pd.read_csv(csv_file)
        avg_data = df.groupby('threads')['duration_ms'].mean().reset_index()
        
        baseline = avg_data[avg_data['threads'] == 1]['duration_ms'].values[0]
        
        for _, row in avg_data.iterrows():
            threads = int(row['threads'])
            time_ms = row['duration_ms']
            speedup = baseline / time_ms
            efficiency = (speedup / threads) * 100
            
            f.write(f"{threads:<10} {time_ms:<15.2f} {speedup:<15.2f} {efficiency:<15.1f}%\n")
        
        f.write("\n\n")

print(f"  Saved: {summary_file}")

print("\n" + "=" * 50)
print("All graphs generated successfully!")
print("=" * 50)
print("\nGenerated files:")
print(f"  - 4 individual structure graphs")
print(f"  - 1 combined comparison graph")
print(f"  - 1 speedup analysis graph")
print(f"  - 1 performance summary table")
print(f"\nLocation: {OUTPUT_DIR}/")
