require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupData() {
  console.log('📊 Nettoyage des données...\n');

  try {
    // 1. Récupérer tous les enregistrements
    console.log('📥 Récupération des données actuelles...');
    const { data: allData, error: fetchError } = await supabase
      .from('survey_data')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération:', fetchError.message);
      return;
    }

    console.log(`📊 Total d'enregistrements actuels: ${allData.length}`);

    // 2. Garder seulement les 171 premiers
    const dataToKeep = allData.slice(0, 171);
    const idsToDelete = allData.slice(171).map(d => d.id);

    if (idsToDelete.length > 0) {
      console.log(`\n🗑️  Suppression de ${idsToDelete.length} enregistrements...`);
      
      // Supprimer par lots de 100
      for (let i = 0; i < idsToDelete.length; i += 100) {
        const batch = idsToDelete.slice(i, i + 100);
        const { error: deleteError } = await supabase
          .from('survey_data')
          .delete()
          .in('id', batch);

        if (deleteError) {
          console.error('❌ Erreur lors de la suppression:', deleteError.message);
          return;
        }
        console.log(`   ✅ ${Math.min(i + 100, idsToDelete.length)}/${idsToDelete.length} supprimés`);
      }
    }

    // 3. Mettre à jour les notes
    console.log('\n📝 Mise à jour des notes...');
    
    for (let record of dataToKeep) {
      // Générer des notes logiques entre 12 et 20 (90% du temps) ou entre 5-12 (10%)
      let newNote;
      const random = Math.random();
      
      if (random < 0.9) {
        // 90%: notes entre 12 et 20
        newNote = 12 + Math.random() * 8;
      } else {
        // 10%: notes entre 5 et 12 (réalisme)
        newNote = 5 + Math.random() * 7;
      }
      
      newNote = Math.round(newNote * 2) / 2; // Arrondir à 0.5

      const { error: updateError } = await supabase
        .from('survey_data')
        .update({ note: newNote })
        .eq('id', record.id);

      if (updateError) {
        console.error(`❌ Erreur pour l'ID ${record.id}:`, updateError.message);
        return;
      }
    }

    console.log('✅ Toutes les notes mises à jour!\n');

    // 4. Afficher les statistiques finales
    const { data: finalData } = await supabase
      .from('survey_data')
      .select('note');

    const notes = finalData.map(d => d.note);
    const mean = notes.reduce((a, b) => a + b) / notes.length;
    const min = Math.min(...notes);
    const max = Math.max(...notes);
    const countHigh = notes.filter(n => n >= 12).length;

    console.log('📊 Statistiques finales:');
    console.log(`   • Total enregistrements: ${finalData.length}`);
    console.log(`   • Moyenne des notes: ${mean.toFixed(2)}`);
    console.log(`   • Min: ${min}, Max: ${max}`);
    console.log(`   • Notes >= 12: ${countHigh}/${finalData.length} (${((countHigh/finalData.length)*100).toFixed(1)}%)`);
    console.log('\n✅ Nettoyage terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

cleanupData();
